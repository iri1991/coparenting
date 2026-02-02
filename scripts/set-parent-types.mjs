#!/usr/bin/env node
/**
 * Setează parentType (tata / mama) pentru utilizatorii cunoscuți.
 * Rulează o singură dată după ce ai creat conturile.
 *
 * Usage: MONGODB_URI="..." MONGODB_DB=coparenting node scripts/set-parent-types.mjs
 * Sau din rădăcina proiectului cu .env: node --env-file=.env scripts/set-parent-types.mjs
 */

import { MongoClient } from "mongodb";

const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB = process.env.MONGODB_DB || "coparenting";

const EMAIL_TO_PARENT = [
  { email: "me@irinelnicoara.ro", parentType: "tata" },
  { email: "andramd2803@gmail.com", parentType: "mama" },
];

async function main() {
  if (!MONGODB_URI) {
    console.error("MONGODB_URI lipsește. Setează variabila de mediu sau folosește --env-file=.env");
    process.exit(1);
  }
  const client = new MongoClient(MONGODB_URI);
  try {
    await client.connect();
    const db = client.db(MONGODB_DB);
    const col = db.collection("users");
    for (const { email, parentType } of EMAIL_TO_PARENT) {
      const norm = email.toLowerCase().trim();
      const result = await col.updateOne(
        { email: norm },
        { $set: { parentType, updatedAt: new Date() } }
      );
      if (result.matchedCount) {
        console.log(`OK: ${email} → ${parentType}`);
      } else {
        console.warn(`Nu am găsit user cu email: ${email}`);
      }
    }
  } finally {
    await client.close();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
