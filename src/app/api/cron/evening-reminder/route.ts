import { NextResponse } from "next/server";
import { addDays, format } from "date-fns";
import { ro } from "date-fns/locale";
import { getDb } from "@/lib/mongodb";
import { getEventDisplayLabel } from "@/types/events";
import { getSubscriptionsForUsers, sendPushToSubscriptions } from "@/lib/push";
import type { ParentType, LocationType } from "@/types/events";

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

function toDisplayEvent(doc: {
  type?: string | null;
  parent?: string | null;
  location?: string | null;
  locationLabel?: string | null;
  startTime?: string | null;
  endTime?: string | null;
}) {
  const hasNew = doc.parent != null && doc.location != null;
  const parent = (hasNew ? doc.parent : deriveFromType(doc.type ?? "other").parent) as ParentType;
  const location = (hasNew ? doc.location : deriveFromType(doc.type ?? "other").location) as LocationType;
  const locationLabel = doc.locationLabel ?? undefined;
  const label = getEventDisplayLabel({ parent, location, locationLabel } as Parameters<typeof getEventDisplayLabel>[0]);
  const time =
    doc.startTime || doc.endTime
      ? [doc.startTime, doc.endTime].filter(Boolean).join(" – ")
      : null;
  return time ? `${label} (${time})` : label;
}

/**
 * Cron: rulează seara (ex. 21:00 Romania) și trimite tuturor utilizatorilor
 * o notificare push cu evenimentele de mâine (preluare / program).
 * Protejat cu CRON_SECRET.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  const { searchParams } = new URL(request.url);
  const querySecret = searchParams.get("secret");
  const ok =
    secret &&
    (authHeader === `Bearer ${secret}` || querySecret === secret);
  if (!ok) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }

  const tomorrow = addDays(new Date(), 1);
  const tomorrowStr = format(tomorrow, "yyyy-MM-dd");
  const tomorrowLabel = format(tomorrow, "EEEE, d MMM", { locale: ro });

  const db = await getDb();
  const events = await db
    .collection("schedule_events")
    .find({ date: tomorrowStr })
    .sort({ startTime: 1, date: 1 })
    .toArray();

  const subs = await getSubscriptionsForUsers([]);
  if (subs.length === 0) {
    return NextResponse.json({
      ok: true,
      message: "Niciun abonament push – niciun mesaj trimis.",
      date: tomorrowStr,
    });
  }

  if (events.length === 0) {
    await sendPushToSubscriptions(subs, {
      title: `Mâine: ${tomorrowLabel}`,
      body: "Niciun eveniment programat.",
      url: "/",
    });
    return NextResponse.json({
      ok: true,
      date: tomorrowStr,
      eventsCount: 0,
      pushSent: subs.length,
    });
  }

  const lines = events.map((doc) => toDisplayEvent(doc as Parameters<typeof toDisplayEvent>[0]));
  const body = lines.join(" · ");

  await sendPushToSubscriptions(subs, {
    title: `Mâine: ${tomorrowLabel}`,
    body,
    url: "/",
  });

  return NextResponse.json({
    ok: true,
    date: tomorrowStr,
    eventsCount: events.length,
    pushSent: subs.length,
  });
}
