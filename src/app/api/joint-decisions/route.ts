import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import {
  sendDecisionProposedNotification,
  sendDecisionRespondedNotification,
} from "@/lib/notify";
import type { JointDecision, DecisionCategory, DecisionStatus } from "@/types/joint-decision";
import type { ParentType } from "@/types/events";

const CATEGORIES: DecisionCategory[] = [
  "education",
  "medical",
  "activities",
  "financial",
  "travel",
  "other",
];

function clampStr(v: unknown, max = 500): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

function toDecision(doc: {
  _id: unknown;
  proposedByUserId: string;
  proposedByParentType: string;
  title: string;
  category: string;
  description?: string | null;
  status: string;
  decidedByUserId?: string | null;
  decidedAt?: Date | null;
  responseNote?: string | null;
  createdAt: Date;
  updatedAt: Date;
}): JointDecision {
  return {
    id: String(doc._id),
    proposedByUserId: String(doc.proposedByUserId),
    proposedByParentType: doc.proposedByParentType as ParentType,
    title: doc.title,
    category: CATEGORIES.includes(doc.category as DecisionCategory)
      ? (doc.category as DecisionCategory)
      : "other",
    description: doc.description ?? undefined,
    status: (["pending", "approved", "declined"].includes(doc.status) ? doc.status : "pending") as DecisionStatus,
    decidedByUserId: doc.decidedByUserId ? String(doc.decidedByUserId) : undefined,
    decidedAt: doc.decidedAt ? doc.decidedAt.toISOString() : undefined,
    responseNote: doc.responseNote ?? undefined,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

async function requireFamily(session: Awaited<ReturnType<typeof auth>>) {
  if (!session?.user?.id) return { error: NextResponse.json({ error: "Neautorizat" }, { status: 401 }) };
  if (!session.user.familyId) {
    return { error: NextResponse.json({ error: "Creați sau aderați la o familie mai întâi." }, { status: 400 }) };
  }
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    return { error: NextResponse.json({ error: "Familia nu există sau a fost dezactivată." }, { status: 403 }) };
  }
  return { db, familyId, family };
}

/** GET: toate deciziile familiei (pending întâi, apoi după dată). */
export async function GET() {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const docs = await db
    .collection("joint_decisions")
    .find({ familyId })
    .sort({ createdAt: -1 })
    .limit(200)
    .toArray();

  const list = (docs as Parameters<typeof toDecision>[0][]).map(toDecision);
  // pending întâi, apoi restul (deja sortate desc după dată)
  list.sort((a, b) => {
    if (a.status === "pending" && b.status !== "pending") return -1;
    if (a.status !== "pending" && b.status === "pending") return 1;
    return 0;
  });
  return NextResponse.json({ decisions: list });
}

/** POST: propune o decizie nouă (status pending). */
export async function POST(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const proposedByParentType = session!.user!.parentType;
  if (proposedByParentType !== "tata" && proposedByParentType !== "mama") {
    return NextResponse.json(
      { error: "Setează în Configurare rolul tău (primul sau al doilea părinte)." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const title = clampStr(body.title, 150);
  if (!title) return NextResponse.json({ error: "Titlul deciziei este obligatoriu." }, { status: 400 });
  const category: DecisionCategory = CATEGORIES.includes(body.category) ? body.category : "other";

  const now = new Date();
  const { insertedId } = await db.collection("joint_decisions").insertOne({
    familyId,
    proposedByUserId: session!.user!.id,
    proposedByParentType,
    title,
    category,
    description: clampStr(body.description, 1000),
    status: "pending",
    decidedByUserId: null,
    decidedAt: null,
    responseNote: null,
    createdAt: now,
    updatedAt: now,
  });
  const created = await db.collection("joint_decisions").findOne({ _id: insertedId });

  const displayName = await getParentDisplayName(db, familyId, session!.user!.id, proposedByParentType);
  await logFamilyActivity(db, familyId, session!.user!.id, displayName, "joint_decision_added", { label: title });
  try {
    await sendDecisionProposedNotification(db, familyId, session!.user!.id, displayName, title);
  } catch {
    // notificarea nu blochează răspunsul
  }
  return NextResponse.json({ decision: toDecision(created as Parameters<typeof toDecision>[0]) });
}

/**
 * PATCH: două moduri.
 *  - propunătorul editează title/category/description (doar cât e pending)
 *  - celălalt părinte răspunde: action "approve" | "decline" (+ responseNote opțional)
 */
export async function PATCH(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const body = await request.json().catch(() => ({}));
  const id = typeof body.id === "string" ? body.id : "";
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }

  const existing = await db.collection("joint_decisions").findOne({ _id: oid, familyId });
  if (!existing) return NextResponse.json({ error: "Decizie negăsită." }, { status: 404 });
  const decision = toDecision(existing as Parameters<typeof toDecision>[0]);
  const userId = session!.user!.id;

  // ── Mod răspuns (approve/decline) ──
  if (body.action === "approve" || body.action === "decline") {
    if (decision.proposedByUserId === userId) {
      return NextResponse.json({ error: "Nu poți răspunde la propria propunere." }, { status: 403 });
    }
    if (decision.status !== "pending") {
      return NextResponse.json({ error: "Decizia a fost deja soluționată." }, { status: 400 });
    }
    const status: DecisionStatus = body.action === "approve" ? "approved" : "declined";
    const now = new Date();
    await db.collection("joint_decisions").updateOne(
      { _id: oid, familyId },
      {
        $set: {
          status,
          decidedByUserId: userId,
          decidedAt: now,
          responseNote: clampStr(body.responseNote, 500),
          updatedAt: now,
        },
      }
    );
    const responderName = await getParentDisplayName(db, familyId, userId, session!.user!.parentType ?? undefined);
    await logFamilyActivity(
      db,
      familyId,
      userId,
      responderName,
      status === "approved" ? "joint_decision_approved" : "joint_decision_declined",
      { label: decision.title }
    );
    try {
      await sendDecisionRespondedNotification(decision.proposedByUserId, responderName, decision.title, status);
    } catch {
      // ignoră erorile de notificare
    }
    const updated = await db.collection("joint_decisions").findOne({ _id: oid, familyId });
    return NextResponse.json({ decision: toDecision(updated as Parameters<typeof toDecision>[0]) });
  }

  // ── Mod editare (doar propunătorul, doar cât e pending) ──
  if (decision.proposedByUserId !== userId) {
    return NextResponse.json({ error: "Doar cel care a propus poate edita." }, { status: 403 });
  }
  if (decision.status !== "pending") {
    return NextResponse.json({ error: "Decizia soluționată nu mai poate fi editată." }, { status: 400 });
  }
  const update: Record<string, unknown> = { updatedAt: new Date() };
  if ("title" in body) {
    const t = clampStr(body.title, 150);
    if (!t) return NextResponse.json({ error: "Titlul nu poate fi gol." }, { status: 400 });
    update.title = t;
  }
  if ("category" in body) update.category = CATEGORIES.includes(body.category) ? body.category : "other";
  if ("description" in body) update.description = clampStr(body.description, 1000);

  await db.collection("joint_decisions").updateOne({ _id: oid, familyId }, { $set: update });
  const updated = await db.collection("joint_decisions").findOne({ _id: oid, familyId });
  return NextResponse.json({ decision: toDecision(updated as Parameters<typeof toDecision>[0]) });
}

/** DELETE: șterge o propunere proprie. */
export async function DELETE(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") || "";
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  const result = await db
    .collection("joint_decisions")
    .deleteOne({ _id: oid, familyId, proposedByUserId: session!.user!.id });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Decizie negăsită sau nu îți aparține." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
