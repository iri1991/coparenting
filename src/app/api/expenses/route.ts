import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import { sendExpenseAddedNotification } from "@/lib/notify";
import {
  EXPENSE_CATEGORY_ORDER,
  owedBani,
  type ExpenseCategory,
  type SharedExpense,
} from "@/types/expense";
import type { ParentType } from "@/types/events";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function clampStr(v: unknown, max = 200): string | null {
  if (typeof v !== "string") return null;
  const t = v.trim();
  if (!t) return null;
  return t.slice(0, max);
}

/** Acceptă number (lei) sau string ("123,45" / "123.45") → bani (integer). */
function parseAmountBani(v: unknown): number | null {
  let lei: number;
  if (typeof v === "number") lei = v;
  else if (typeof v === "string") lei = Number(v.replace(",", ".").trim());
  else return null;
  if (!Number.isFinite(lei) || lei <= 0 || lei > 1_000_000) return null;
  return Math.round(lei * 100);
}

function toExpense(doc: {
  _id: unknown;
  title: string;
  category: string;
  amountBani: number;
  paidByUserId: string;
  paidByParentType: string;
  date: string;
  splitPercent?: number;
  note?: string | null;
  settled?: boolean;
  settledAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}): SharedExpense {
  return {
    id: String(doc._id),
    title: doc.title,
    category: EXPENSE_CATEGORY_ORDER.includes(doc.category as ExpenseCategory)
      ? (doc.category as ExpenseCategory)
      : "other",
    amountBani: Math.round(doc.amountBani),
    paidByUserId: String(doc.paidByUserId),
    paidByParentType: doc.paidByParentType === "tata" ? "tata" : "mama",
    date: doc.date,
    splitPercent:
      typeof doc.splitPercent === "number" && doc.splitPercent >= 0 && doc.splitPercent <= 100
        ? doc.splitPercent
        : 50,
    note: doc.note ?? undefined,
    settled: doc.settled === true,
    settledAt: doc.settledAt ? doc.settledAt.toISOString() : undefined,
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

/** Soldul net din perspectiva lui „tata” (bani) din cheltuielile nedecontate. */
function computeBalance(expenses: SharedExpense[]): number {
  let tataNet = 0;
  for (const e of expenses) {
    if (e.settled) continue;
    const owed = owedBani(e.amountBani, e.splitPercent);
    if (e.paidByParentType === "tata") tataNet += owed; // mama îi datorează lui tata
    else tataNet -= owed; // tata îi datorează mamei
  }
  return tataNet;
}

/** GET: cheltuielile familiei + soldul. */
export async function GET() {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const docs = await db
    .collection("shared_expenses")
    .find({ familyId })
    .sort({ date: -1, createdAt: -1 })
    .limit(300)
    .toArray();
  const expenses = (docs as Parameters<typeof toExpense>[0][]).map(toExpense);
  return NextResponse.json({ expenses, balance: { tataNetBani: computeBalance(expenses) } });
}

/** POST: adaugă o cheltuială. */
export async function POST(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const myParentType = session!.user!.parentType;
  if (myParentType !== "tata" && myParentType !== "mama") {
    return NextResponse.json(
      { error: "Setează în Configurare rolul tău (primul sau al doilea părinte)." },
      { status: 400 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const title = clampStr(body.title, 150);
  if (!title) return NextResponse.json({ error: "Titlul cheltuielii este obligatoriu." }, { status: 400 });
  const amountBani = parseAmountBani(body.amount);
  if (amountBani === null) return NextResponse.json({ error: "Sumă invalidă." }, { status: 400 });
  const category: ExpenseCategory = EXPENSE_CATEGORY_ORDER.includes(body.category) ? body.category : "other";
  const paidByParentType: ParentType =
    body.paidByParentType === "tata" || body.paidByParentType === "mama" ? body.paidByParentType : myParentType;
  const date = typeof body.date === "string" && DATE_RE.test(body.date) ? body.date : new Date().toISOString().slice(0, 10);
  const splitPercent =
    typeof body.splitPercent === "number" && body.splitPercent >= 0 && body.splitPercent <= 100
      ? Math.round(body.splitPercent)
      : 50;

  const now = new Date();
  const { insertedId } = await db.collection("shared_expenses").insertOne({
    familyId,
    title,
    category,
    amountBani,
    paidByUserId: session!.user!.id,
    paidByParentType,
    date,
    splitPercent,
    note: clampStr(body.note, 500),
    settled: false,
    settledAt: null,
    createdAt: now,
    updatedAt: now,
  });
  const created = await db.collection("shared_expenses").findOne({ _id: insertedId });

  const displayName = await getParentDisplayName(db, familyId, session!.user!.id, myParentType);
  await logFamilyActivity(db, familyId, session!.user!.id, displayName, "expense_added", { label: title });
  try {
    await sendExpenseAddedNotification(db, familyId, session!.user!.id, displayName, title, amountBani);
  } catch {
    // notificarea nu blochează răspunsul
  }
  return NextResponse.json({ expense: toExpense(created as Parameters<typeof toExpense>[0]) });
}

/** PATCH: editează o cheltuială, comută `settled`, sau `action: "settle-all"`. */
export async function PATCH(request: Request) {
  const session = await auth();
  const ctx = await requireFamily(session);
  if (ctx.error) return ctx.error;
  const { db, familyId } = ctx;

  const body = await request.json().catch(() => ({}));

  // Decontează tot dintr-o singură mișcare.
  if (body.action === "settle-all") {
    await db
      .collection("shared_expenses")
      .updateMany(
        { familyId, settled: { $ne: true } },
        { $set: { settled: true, settledAt: new Date(), updatedAt: new Date() } }
      );
    return NextResponse.json({ ok: true });
  }

  const id = typeof body.id === "string" ? body.id : "";
  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }

  const update: Record<string, unknown> = { updatedAt: new Date() };
  if ("title" in body) {
    const t = clampStr(body.title, 150);
    if (!t) return NextResponse.json({ error: "Titlul nu poate fi gol." }, { status: 400 });
    update.title = t;
  }
  if ("amount" in body) {
    const a = parseAmountBani(body.amount);
    if (a === null) return NextResponse.json({ error: "Sumă invalidă." }, { status: 400 });
    update.amountBani = a;
  }
  if ("category" in body) update.category = EXPENSE_CATEGORY_ORDER.includes(body.category) ? body.category : "other";
  if ("paidByParentType" in body && (body.paidByParentType === "tata" || body.paidByParentType === "mama")) {
    update.paidByParentType = body.paidByParentType;
  }
  if ("splitPercent" in body && typeof body.splitPercent === "number" && body.splitPercent >= 0 && body.splitPercent <= 100) {
    update.splitPercent = Math.round(body.splitPercent);
  }
  if ("note" in body) update.note = clampStr(body.note, 500);
  if ("settled" in body && typeof body.settled === "boolean") {
    update.settled = body.settled;
    update.settledAt = body.settled ? new Date() : null;
  }

  const result = await db.collection("shared_expenses").updateOne({ _id: oid, familyId }, { $set: update });
  if (result.matchedCount === 0) {
    return NextResponse.json({ error: "Cheltuială negăsită." }, { status: 404 });
  }
  const updated = await db.collection("shared_expenses").findOne({ _id: oid, familyId });
  return NextResponse.json({ expense: toExpense(updated as Parameters<typeof toExpense>[0]) });
}

/** DELETE: șterge o cheltuială. */
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
  const result = await db.collection("shared_expenses").deleteOne({ _id: oid, familyId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Cheltuială negăsită." }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
