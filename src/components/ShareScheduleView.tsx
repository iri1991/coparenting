"use client";

import type { ParentType, LocationType } from "@/types/events";

export interface ShareDayEvent {
  id: string;
  date: string;
  parent: ParentType;
  location: LocationType;
  locationLabel?: string;
  title?: string;
}

interface ShareScheduleViewProps {
  weekLabel: string;
  weekStart: string;
  weekEnd: string;
  parent1Name: string;
  parent2Name: string;
  familyName?: string;
  residenceNames: string[];
  days: { date: string; label: string; events: ShareDayEvent[] }[];
}

function getParentLabel(parent: ParentType, parent1Name: string, parent2Name: string): string {
  switch (parent) {
    case "tata":
      return parent1Name;
    case "mama":
      return parent2Name;
    case "together":
      return "Împreună";
    default:
      return parent1Name;
  }
}

function getLocationLabel(
  location: string,
  locationLabel: string | undefined,
  residenceNames: string[]
): string {
  if (location === "other") return locationLabel?.trim() || "Alte locații";
  if (location === "tunari") return residenceNames[0] || "Tunari";
  if (location === "otopeni") return residenceNames[1] || "Otopeni";
  return locationLabel || "Locație";
}

function EventLine({
  event,
  parent1Name,
  parent2Name,
  residenceNames,
}: {
  event: ShareDayEvent;
  parent1Name: string;
  parent2Name: string;
  residenceNames: string[];
}) {
  const parentStr = getParentLabel(event.parent, parent1Name, parent2Name);
  const locStr = getLocationLabel(event.location, event.locationLabel, residenceNames);
  return (
    <div className="flex items-center gap-2 text-stone-700 dark:text-stone-300">
      <span className="font-medium text-amber-800 dark:text-amber-200">{parentStr}</span>
      <span className="text-stone-400 dark:text-stone-500">·</span>
      <span>{locStr}</span>
      {event.title?.trim() && (
        <>
          <span className="text-stone-400">–</span>
          <span className="italic text-stone-600 dark:text-stone-400">{event.title.trim()}</span>
        </>
      )}
    </div>
  );
}

function addDays(dateStr: string, n: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

export function ShareScheduleView({
  weekLabel,
  weekStart,
  weekEnd,
  parent1Name,
  parent2Name,
  familyName,
  residenceNames,
  days,
}: ShareScheduleViewProps) {
  const prevMonday = addDays(weekStart, -7);
  const nextMonday = addDays(weekStart, 7);

  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 text-stone-900 dark:text-stone-100">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
        <div className="print:hidden fixed top-4 right-4 z-10 flex gap-2">
          <a
            href={`?week=${prevMonday}`}
            className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            ← Săpt. anterioară
          </a>
          <a
            href={`?week=${nextMonday}`}
            className="px-3 py-2 rounded-xl border border-stone-200 dark:border-stone-600 bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-sm font-medium hover:bg-stone-50 dark:hover:bg-stone-700"
          >
            Săpt. următoare →
          </a>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-amber-500 text-white font-medium shadow-lg hover:bg-amber-600 transition"
          >
            Salvează ca PDF
          </button>
        </div>

        <header className="mb-10 text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-800 dark:text-stone-100 tracking-tight">
            Program săptămânal
          </h1>
          {familyName && (
            <p className="mt-1 text-stone-500 dark:text-stone-400 text-sm">{familyName}</p>
          )}
          <p className="mt-3 text-lg text-amber-700 dark:text-amber-300 font-medium">
            {weekLabel}
          </p>
        </header>

        <div className="space-y-6">
          {days.map((day) => (
            <section
              key={day.date}
              className="rounded-2xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 shadow-sm overflow-hidden print:break-inside-avoid"
            >
              <div className="px-4 py-3 bg-stone-100 dark:bg-stone-800/80 border-b border-stone-200 dark:border-stone-700">
                <h2 className="font-semibold text-stone-800 dark:text-stone-100 capitalize">
                  {day.label}
                </h2>
              </div>
              <div className="px-4 py-4">
                {day.events.length === 0 ? (
                  <p className="text-stone-400 dark:text-stone-500 text-sm italic">
                    Fără evenimente
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {day.events.map((event) => (
                      <li key={event.id}>
                        <EventLine
                          event={event}
                          parent1Name={parent1Name}
                          parent2Name={parent2Name}
                          residenceNames={residenceNames}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-12 pt-6 border-t border-stone-200 dark:border-stone-800 text-center text-stone-400 dark:text-stone-500 text-sm print:hidden">
          Generat de HomeSplit · Doar vizualizare
        </footer>
      </div>
    </div>
  );
}
