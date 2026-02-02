import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import Link from "next/link";
import { DashboardClient } from "@/components/DashboardClient";
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
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
        <div className="max-w-sm w-full text-center space-y-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              Eva &amp; Coparenting
            </h1>
            <p className="mt-2 text-stone-600 dark:text-stone-400 text-sm">
              Planifică zilele cu Eva – Tunari, Otopeni, cu toții. Simplu și sincronizat.
            </p>
          </div>
          <Link
            href="/login"
            className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600 active:scale-[0.98] transition"
          >
            Conectare
          </Link>
          <p className="text-stone-500 text-xs">
            Folosește aceeași aplicație împreună cu Andreea – evenimentele se sincronizează.
          </p>
        </div>
      </div>
    );
  }

  let events: ScheduleEvent[] = [];
  try {
    const db = await getDb();
    const docs = await db
      .collection("schedule_events")
      .find({})
      .sort({ date: 1 })
      .toArray();
    events = docs.map((d) => toEvent(d as Parameters<typeof toEvent>[0]));
  } catch (e) {
    console.error(e);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900 flex flex-col">
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-stone-900/80 backdrop-blur border-b border-stone-200 dark:border-stone-800 safe-area-inset-top">
        <div className="flex items-center justify-between px-4 py-3 max-w-2xl mx-auto">
          <h1 className="text-lg font-bold text-stone-800 dark:text-stone-100">
            Eva &amp; Coparenting
          </h1>
          <div className="flex items-center gap-2">
            <Link
              href="/api/calendar/ics"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 touch-manipulation"
              title="Exportă calendar (.ics)"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </Link>
            <a
              href="/api/auth/signout"
              className="p-2 rounded-lg hover:bg-stone-100 dark:hover:bg-stone-800 text-stone-600 dark:text-stone-400 text-sm font-medium touch-manipulation"
            >
              Ieșire
            </a>
          </div>
        </div>
      </header>
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full pb-safe">
        <DashboardClient
          initialEvents={events}
          currentUserId={session.user.id}
          userName={
            session.user.name?.trim() ||
            (session.user.email ? session.user.email.split("@")[0] : null) ||
            "acolo"
          }
        />
      </main>
    </div>
  );
}
