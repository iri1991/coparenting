import { notFound } from "next/navigation";
import { getDb } from "@/lib/mongodb";
import { getMondayOfWeek, addDays } from "@/lib/week";
import { ShareScheduleView, type ShareDayEvent } from "@/components/ShareScheduleView";
import type { ParentType, LocationType } from "@/types/events";

function deriveFromType(type: string): { parent: ParentType; location: LocationType } {
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

export default async function SharePage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ week?: string }>;
}) {
  const { token } = await params;
  const { week: weekParam } = await searchParams;
  if (!token?.trim()) notFound();

  const db = await getDb();
  const family = await db.collection("families").findOne(
    { shareToken: token, active: { $ne: false } },
    { projection: { _id: 1, parent1Name: 1, parent2Name: 1, name: 1 } }
  );
  if (!family) notFound();

  const familyId = (family as { _id: unknown })._id;
  const now = new Date();
  const weekStart =
    typeof weekParam === "string" && /^\d{4}-\d{2}-\d{2}$/.test(weekParam)
      ? weekParam
      : getMondayOfWeek(now);
  const weekEnd = addDays(weekStart, 6);

  const [eventDocs, residenceDocs] = await Promise.all([
    db
      .collection("schedule_events")
      .find({
        familyId,
        date: { $gte: weekStart, $lte: weekEnd },
      })
      .sort({ date: 1 })
      .toArray(),
    db
      .collection("residences")
      .find({ familyId })
      .sort({ order: 1, createdAt: 1 })
      .toArray(),
  ]);

  const parent1Name =
    (family as { parent1Name?: string }).parent1Name?.trim() || "Părinte 1";
  const parent2Name =
    (family as { parent2Name?: string }).parent2Name?.trim() || "Părinte 2";
  const familyName = (family as { name?: string }).name?.trim();
  const residenceNames = (residenceDocs as { name: string }[]).map((r) => r.name);

  const events: ShareDayEvent[] = (eventDocs as {
    _id: unknown;
    date: string;
    type?: string | null;
    parent?: string | null;
    location?: string | null;
    locationLabel?: string | null;
    title?: string | null;
  }[]).map((d) => {
    const hasNew = d.parent != null && d.location != null;
    const parent = (hasNew
      ? d.parent
      : deriveFromType(d.type ?? "other").parent) as ParentType;
    const location = (hasNew
      ? d.location
      : deriveFromType(d.type ?? "other").location) as LocationType;
    return {
      id: String(d._id),
      date: d.date,
      parent,
      location,
      locationLabel: d.locationLabel ?? undefined,
      title: d.title ?? undefined,
    };
  });

  const days: { date: string; label: string; events: ShareDayEvent[] }[] = [];
  for (let i = 0; i < 7; i++) {
    const date = addDays(weekStart, i);
    const d = new Date(date + "T12:00:00");
    const dayName = d.toLocaleDateString("ro-RO", { weekday: "long" });
    const dateLabel = d.toLocaleDateString("ro-RO", { day: "numeric", month: "short" });
    days.push({
      date,
      label: `${dayName}, ${dateLabel}`,
      events: events.filter((e) => e.date === date),
    });
  }

  const weekStartDate = new Date(weekStart + "T12:00:00");
  const weekEndDate = new Date(weekEnd + "T12:00:00");
  const weekLabel = `${weekStartDate.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
  })} – ${weekEndDate.toLocaleDateString("ro-RO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })}`;

  return (
    <ShareScheduleView
      weekLabel={weekLabel}
      weekStart={weekStart}
      weekEnd={weekEnd}
      parent1Name={parent1Name}
      parent2Name={parent2Name}
      familyName={familyName}
      residenceNames={residenceNames}
      days={days}
    />
  );
}
