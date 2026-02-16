import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { LoggedInLayout } from "@/components/LoggedInLayout";
import type { ScheduleEvent, ParentType, LocationType } from "@/types/events";

function deriveFromType(
  type: string
): { parent: ParentType; location: LocationType } {
  switch (type) {
    case "tunari":
      return { parent: "tata", location: "tunari" };
    case "otopeni":
      return { parent: "mama", location: "otopeni" };
    case "together":
      return { parent: "together", location: "other" };
    default:
      return { parent: "tata", location: "other" };
  }
}

function toEvent(doc: {
  _id: unknown;
  date: string;
  type?: string | null;
  parent?: string | null;
  location?: string | null;
  locationLabel?: string | null;
  title?: string | null;
  notes?: string | null;
  startTime?: string | null;
  endTime?: string | null;
  created_by: string | null;
  created_at: Date;
}): ScheduleEvent {
  const hasNew = doc.parent != null && doc.location != null;
  const parent = (hasNew ? doc.parent : deriveFromType(doc.type ?? "other").parent) as ParentType;
  const location = (hasNew ? doc.location : deriveFromType(doc.type ?? "other").location) as LocationType;
  return {
    id: String(doc._id),
    date: doc.date,
    parent,
    location,
    locationLabel: doc.locationLabel ?? undefined,
    title: doc.title ?? undefined,
    notes: doc.notes ?? undefined,
    startTime: doc.startTime ?? undefined,
    endTime: doc.endTime ?? undefined,
    created_by: doc.created_by ?? "",
    created_at: doc.created_at.toISOString(),
  };
}

export default async function HomePage() {
  const session = await auth();

  if (!session?.user?.id) {
    const { LandingPage: Landing } = await import("@/components/landing/LandingPage");
    return <Landing />;
  }

  if (!session.user.familyId) {
    redirect("/setup");
  }

  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    redirect("/family-deactivated");
  }
  const [children, residences, eventDocs, userDoc] = await Promise.all([
    db.collection("children").find({ familyId }).sort({ createdAt: 1 }).toArray(),
    db.collection("residences").find({ familyId }).sort({ order: 1, createdAt: 1 }).toArray(),
    db.collection("schedule_events").find({ familyId }).sort({ date: 1 }).toArray(),
    db.collection("users").findOne(
      { _id: new ObjectId(session.user.id) },
      { projection: { chatLastReadAt: 1 } }
    ),
  ]);

  const hasChildren = (children as unknown[]).length > 0;
  const hasResidences = (residences as unknown[]).length > 0;
  if (!hasChildren || !hasResidences) {
    redirect("/config");
  }

  const chatLastReadAt = (userDoc as { chatLastReadAt?: Date } | null)?.chatLastReadAt ?? null;
  const chatUnreadFilter: { familyId: ObjectId; createdAt?: { $gt: Date } } = { familyId };
  if (chatLastReadAt) chatUnreadFilter.createdAt = { $gt: chatLastReadAt };
  const chatUnreadCount = await db.collection("messages").countDocuments(chatUnreadFilter);

  const events: ScheduleEvent[] = (eventDocs as Parameters<typeof toEvent>[0][]).map((d) => toEvent(d));
  const familyData = family as { parent1Name?: string; parent2Name?: string };
  const parent1Name = familyData.parent1Name?.trim() || "Părinte 1";
  const parent2Name = familyData.parent2Name?.trim() || "Părinte 2";
  const childName = (children as unknown as { name: string }[])[0]?.name || "copilul";

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900 flex flex-col">
      <LoggedInLayout
        initialEvents={events}
        currentUserId={session.user.id}
        userName={
          session.user.name?.trim() ||
          (session.user.email ? session.user.email.split("@")[0] : null) ||
          "acolo"
        }
        parent1Name={parent1Name}
        parent2Name={parent2Name}
        childName={childName}
        residenceNames={(residences as unknown as { name: string }[]).map((r) => r.name)}
        initialUnreadCount={chatUnreadCount}
        isAdmin={(session.user.email ?? "").toLowerCase() === "me@irinelnicoara.ro"}
      />
    </div>
  );
}
