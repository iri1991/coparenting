/**
 * Limitare simplă a ratei, persistată în MongoDB (funcționează și cu mai multe instanțe).
 * Înregistrările expiră automat (index TTL).
 */
import { getDb } from "@/lib/mongodb";

let indexReady: Promise<unknown> | null = null;

async function collection() {
  const db = await getDb();
  const col = db.collection("rate_limits");
  if (!indexReady) {
    indexReady = Promise.all([
      col.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
      col.createIndex({ key: 1, at: -1 }),
    ]).catch(() => {
      indexReady = null;
    });
  }
  await indexReady;
  return col;
}

/** Câte încercări au fost înregistrate pentru cheie în fereastra dată. */
export async function countAttempts(key: string, windowMs: number): Promise<number> {
  const col = await collection();
  return col.countDocuments({ key, at: { $gte: new Date(Date.now() - windowMs) } });
}

export async function recordAttempt(key: string, windowMs: number): Promise<void> {
  const col = await collection();
  const now = new Date();
  await col.insertOne({ key, at: now, expiresAt: new Date(now.getTime() + windowMs) });
}

export async function clearAttempts(key: string): Promise<void> {
  const col = await collection();
  await col.deleteMany({ key });
}

/** Înregistrează o încercare și întoarce true dacă limita a fost depășită. */
export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  if ((await countAttempts(key, windowMs)) >= limit) return true;
  await recordAttempt(key, windowMs);
  return false;
}
