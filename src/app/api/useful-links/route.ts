import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { logFamilyActivity } from "@/lib/activity";
import { getParentDisplayName } from "@/lib/parent-display-name";
import { sendUsefulLinkAddedNotification } from "@/lib/notify";

async function getCurrentFamily(userId: string) {
  const db = await getDb();
  const user = await db.collection("users").findOne(
    { _id: new ObjectId(userId) },
    { projection: { familyId: 1 } }
  );
  const familyIdRaw = (user as { familyId?: unknown })?.familyId;
  if (!familyIdRaw) return { db, familyId: null };
  const familyId = new ObjectId(String(familyIdRaw));
  const family = await getActiveFamily(db, familyId);
  if (!family) return { db, familyId: null };
  const memberIds = (family.memberIds ?? []).map(String);
  if (!memberIds.includes(userId)) return { db, familyId: null };
  return { db, familyId };
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const ctx = await getCurrentFamily(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ links: [] });

  const links = await ctx.db.collection("useful_links").find({ familyId: ctx.familyId }).sort({ createdAt: -1 }).toArray();
  return NextResponse.json({
    links: (links as { _id: unknown; title: string; url: string; category?: string; createdAt: Date }[]).map((l) => ({
      id: String(l._id),
      title: l.title,
      url: l.url,
      category: l.category ?? "",
      createdAt: l.createdAt.toISOString(),
    })),
  });
}

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const ctx = await getCurrentFamily(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const body = await request.json().catch(() => ({}));
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const url = typeof body.url === "string" ? body.url.trim() : "";
  const category = typeof body.category === "string" ? body.category.trim() : "";
  if (!title || !url) {
    return NextResponse.json({ error: "Completează titlu și URL." }, { status: 400 });
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json({ error: "URL invalid." }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "URL invalid." }, { status: 400 });
  }

  const now = new Date();
  await ctx.db.collection("useful_links").insertOne({
    familyId: ctx.familyId,
    userId: session.user.id,
    title,
    url,
    category: category || null,
    createdAt: now,
    updatedAt: now,
  });
  const displayName = await getParentDisplayName(ctx.db, ctx.familyId, session.user.id, session.user.parentType ?? undefined);
  await logFamilyActivity(ctx.db, ctx.familyId, session.user.id, displayName, "useful_link_added", {
    name: title,
  });
  const family = await ctx.db.collection("families").findOne(
    { _id: ctx.familyId },
    { projection: { memberIds: 1 } }
  );
  const memberIds = ((family as { memberIds?: string[] } | null)?.memberIds ?? []).map(String);
  const recipients = memberIds.filter((id) => id !== session.user.id);
  sendUsefulLinkAddedNotification(recipients, displayName, title).catch((e) =>
    console.error("[useful-links] push notify", e)
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const ctx = await getCurrentFamily(session.user.id);
  if (!ctx.familyId) return NextResponse.json({ error: "Context familie invalid." }, { status: 400 });

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Lipsește id." }, { status: 400 });

  let oid: ObjectId;
  try {
    oid = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }
  await ctx.db.collection("useful_links").deleteOne({ _id: oid, familyId: ctx.familyId });
  const displayName = await getParentDisplayName(ctx.db, ctx.familyId, session.user.id, session.user.parentType ?? undefined);
  await logFamilyActivity(ctx.db, ctx.familyId, session.user.id, displayName, "useful_link_deleted", {});
  return NextResponse.json({ ok: true });
}

