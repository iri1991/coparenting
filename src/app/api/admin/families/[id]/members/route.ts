import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";

const ADMIN_EMAIL = "me@irinelnicoara.ro";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if ((session.user.email ?? "").toLowerCase() !== ADMIN_EMAIL) {
    return NextResponse.json({ error: "Doar admin." }, { status: 403 });
  }

  const { id } = await params;
  let familyId: ObjectId;
  try {
    familyId = new ObjectId(id);
  } catch {
    return NextResponse.json({ error: "ID invalid." }, { status: 400 });
  }

  const db = await getDb();
  const [family, members, children, events] = await Promise.all([
    db.collection("families").findOne({ _id: familyId }),
    db.collection("users").find({ familyId }).project({ name: 1, email: 1, createdAt: 1 }).toArray(),
    db.collection("children").find({ familyId }).project({ name: 1, birthDate: 1 }).toArray(),
    db.collection("schedule_events").countDocuments({ familyId }),
  ]);

  if (!family) {
    return NextResponse.json({ error: "Familie negăsită." }, { status: 404 });
  }

  return NextResponse.json({
    members: members.map((u) => ({
      id: String(u._id),
      name: u.name ?? "",
      email: u.email ?? "",
      createdAt: u.createdAt ? new Date(u.createdAt).toISOString() : null,
    })),
    children: children.map((c) => ({
      id: String(c._id),
      name: c.name ?? "",
      birthDate: c.birthDate ?? null,
    })),
    eventsCount: events,
  });
}
