#!/usr/bin/env node
/**
 * Normalizează evenimentele multi-zi cu startTime/endTime setate greșit pe toate zilele.
 *
 * Bug: la crearea unui eveniment multi-zi (ex. 23 iun 17:00 → 25 iun 19:00),
 * fiecare zi primea AMBELE startTime și endTime. Corect:
 *   - Ziua 1 (prima):        doar startTime  (endTime → null)
 *   - Zilele intermediare:   fără ore         (ambele → null)
 *   - Ziua N (ultima):       doar endTime    (startTime → null)
 *
 * Evenimentele pe o singură zi cu ambele ore setate sunt CORECTE și nu se ating.
 *
 * Usage:
 *   node --env-file=.env.local scripts/normalize-multiday-events.mjs
 *   node --env-file=.env.local scripts/normalize-multiday-events.mjs --apply
 *
 * Fără --apply → dry-run (afișează ce s-ar schimba, nu modifică nimic)
 * Cu    --apply → aplică modificările
 */

import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "coparenting";
const DRY_RUN = !process.argv.includes("--apply");

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI nu este setat. Folosește: node --env-file=.env.local scripts/normalize-multiday-events.mjs");
  process.exit(1);
}

// ─── helpers ────────────────────────────────────────────────────────────────

/** Adaugă 1 zi la un string YYYY-MM-DD. */
function nextDay(dateStr) {
  const d = new Date(dateStr + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Grupează evenimentele dintr-un grup (aceleași atribute) în serii de date consecutive.
 * O serie cu 2+ zile este candidată la fix.
 */
function findConsecutiveRuns(events) {
  if (events.length === 0) return [];
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  const runs = [];
  let current = [sorted[0]];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].date === nextDay(current[current.length - 1].date)) {
      current.push(sorted[i]);
    } else {
      runs.push(current);
      current = [sorted[i]];
    }
  }
  runs.push(current);
  return runs;
}

/** Cheie de grupare: aceleași meta-date + aceeași pereche startTime/endTime. */
function groupKey(ev) {
  return [
    ev.familyId?.toString() ?? "",
    ev.parent ?? "",
    ev.location ?? "",
    ev.locationLabel ?? "",
    ev.title ?? "",
    ev.notes ?? "",
    ev.caretakerLabel ?? "",
    ev.startTime ?? "",
    ev.endTime ?? "",
  ].join("\x00");
}

// ─── main ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(DRY_RUN
    ? "🔍 DRY-RUN — nicio modificare nu va fi salvată. Adaugă --apply pentru a aplica."
    : "⚡ APPLY — modificările vor fi scrise în baza de date.\n"
  );

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const col = db.collection("schedule_events");

    // Selectăm doar evenimentele cu AMBELE ore setate (candidații la bug).
    const candidates = await col.find({
      startTime: { $nin: [null, ""] },
      endTime:   { $nin: [null, ""] },
    }).toArray();

    console.log(`📦 Evenimente cu ambele ore setate: ${candidates.length}`);
    if (candidates.length === 0) {
      console.log("✅ Nimic de corectat.");
      return;
    }

    // Grupăm după meta-date + pereche ore.
    const groups = new Map();
    for (const ev of candidates) {
      const k = groupKey(ev);
      if (!groups.has(k)) groups.set(k, []);
      groups.get(k).push(ev);
    }

    let totalRuns = 0;
    let totalEvents = 0;
    const updates = []; // { id, set: { startTime, endTime } }

    for (const [, evList] of groups) {
      const runs = findConsecutiveRuns(evList);
      for (const run of runs) {
        if (run.length < 2) continue; // O singură zi → corect, nu atingem
        totalRuns++;
        totalEvents += run.length;

        console.log(`\n📅 Perioadă: ${run[0].date} → ${run[run.length - 1].date}  (${run.length} zile)`);
        console.log(`   👤 ${run[0].parent} | 📍 ${run[0].location} | ⏰ ${run[0].startTime} – ${run[0].endTime}`);

        for (let i = 0; i < run.length; i++) {
          const ev = run[i];
          const isFirst = i === 0;
          const isLast  = i === run.length - 1;

          const newStartTime = isFirst ? ev.startTime : null;
          const newEndTime   = isLast  ? ev.endTime   : null;

          const role = isFirst && isLast ? "singur" : isFirst ? "prima zi" : isLast ? "ultima zi" : "zi intermediară";
          console.log(`   ${ev.date}  [${role}]`
            + `  startTime: ${ev.startTime ?? "—"} → ${newStartTime ?? "—"}`
            + `  endTime: ${ev.endTime ?? "—"} → ${newEndTime ?? "—"}`
          );

          updates.push({
            id: ev._id,
            set: { startTime: newStartTime, endTime: newEndTime },
          });
        }
      }
    }

    console.log(`\n─────────────────────────────────────────────`);
    console.log(`📊 Perioade multi-zi de corectat: ${totalRuns}`);
    console.log(`📝 Evenimente afectate:           ${totalEvents}`);

    if (totalRuns === 0) {
      console.log("✅ Nicio perioadă multi-zi cu bug detectată.");
      return;
    }

    if (DRY_RUN) {
      console.log("\n💡 Rulează cu --apply pentru a aplica modificările.");
      return;
    }

    // Aplicăm updateurile
    console.log("\n✍️  Aplicăm modificările…");
    let ok = 0;
    let err = 0;
    for (const upd of updates) {
      try {
        await col.updateOne(
          { _id: upd.id },
          { $set: { startTime: upd.set.startTime, endTime: upd.set.endTime } }
        );
        ok++;
      } catch (e) {
        console.error(`❌ Eroare la ${upd.id}: ${e.message}`);
        err++;
      }
    }
    console.log(`✅ Actualizate cu succes: ${ok}`);
    if (err > 0) console.log(`❌ Erori: ${err}`);
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error("❌ Eroare fatală:", e);
  process.exit(1);
});
