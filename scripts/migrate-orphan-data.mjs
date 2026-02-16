#!/usr/bin/env node
/**
 * Asociază evenimentele și perioadele blocate "orfane" (fără familyId) la familia
 * utilizatorului dat prin email. Folosește dacă ai migrat la schema cu familii
 * și documentele vechi nu au familyId.
 *
 * Usage:
 *   node --env-file=.env scripts/migrate-orphan-data.mjs --email=ta@email.com
 *   MONGODB_URI="..." MONGODB_DB=coparenting node scripts/migrate-orphan-data.mjs --email=ta@email.com
 */

import { MongoClient, ObjectId } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "coparenting";

function getArg(name) {
  for (const arg of process.argv.slice(2)) {
    if (arg.startsWith(`--${name}=`)) return arg.slice(`--${name}=`.length);
  }
  return null;
}

async function main() {
  const email = getArg("email");
  if (!email?.trim()) {
    console.error("Lipsește --email=ta@email.com");
    process.exit(1);
  }
  if (!MONGODB_URI) {
    console.error("Seteză MONGODB_URI (sau rulează cu --env-file=.env)");
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);

    const user = await db.collection("users").findOne({
      email: email.toLowerCase().trim(),
    });
    if (!user) {
      console.error("Utilizator negăsit pentru email:", email);
      process.exit(1);
    }
    const familyId = user.familyId ?? null;
    if (!familyId) {
      console.error("Utilizatorul nu are familie (familyId). Creează mai întâi familia din app (Setup).");
      process.exit(1);
    }
    const fid = familyId instanceof ObjectId ? familyId : new ObjectId(familyId);
    const family = await db.collection("families").findOne({ _id: fid });
    if (!family) {
      console.error("Familie negăsită pentru id:", familyId);
      process.exit(1);
    }
    const memberIdStrings = (family.memberIds || []).map((id) => (typeof id === "string" ? id : String(id)));

    const eventsResult = await db.collection("schedule_events").updateMany(
      { $or: [{ familyId: { $exists: false } }, { familyId: null }] },
      { $set: { familyId: fid } }
    );
    console.log("schedule_events: %d documente actualizate (familyId setat)", eventsResult.modifiedCount);

    const blockedResult = await db.collection("blocked_periods").updateMany(
      {
        $or: [{ familyId: { $exists: false } }, { familyId: null }],
        userId: { $in: memberIdStrings },
      },
      { $set: { familyId: fid } }
    );
    console.log("blocked_periods: %d documente actualizate (familyId setat)", blockedResult.modifiedCount);

    console.log("Gata. Reîncarcă aplicația.");
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
