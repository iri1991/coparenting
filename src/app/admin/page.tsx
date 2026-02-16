import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { AdminFamiliesTable } from "@/components/AdminFamiliesTable";
import type { PlanType } from "@/types/plan";

const ADMIN_EMAIL = "me@irinelnicoara.ro";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const isAdmin = (session.user.email ?? "").toLowerCase() === ADMIN_EMAIL;
  if (!isAdmin) {
    redirect("/");
  }

  const db = await getDb();
  const [families, usersCount, eventsCount, proposalsCount] = await Promise.all([
    db.collection("families").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection("users").countDocuments(),
    db.collection("schedule_events").countDocuments(),
    db.collection("schedule_proposals").countDocuments(),
  ]);

  const familyIds = (families as { _id: ObjectId }[]).map((f) => f._id);
  const [childrenPerFamily, residencesPerFamily] = await Promise.all([
    db.collection("children").aggregate([{ $match: { familyId: { $in: familyIds } } }, { $group: { _id: "$familyId", count: { $sum: 1 } } }]).toArray(),
    db.collection("residences").aggregate([{ $match: { familyId: { $in: familyIds } } }, { $group: { _id: "$familyId", count: { $sum: 1 } } }]).toArray(),
  ]);
  const childrenMap = new Map((childrenPerFamily as { _id: ObjectId; count: number }[]).map((x) => [String(x._id), x.count]));
  const residencesMap = new Map((residencesPerFamily as { _id: ObjectId; count: number }[]).map((x) => [String(x._id), x.count]));

  const planCounts = { free: 0, pro: 0, family: 0 };
  const familyRows = (families as { _id: ObjectId; plan?: string; memberIds?: string[]; active?: boolean; createdAt: Date }[]).map((f) => {
    const plan: PlanType = f.plan === "pro" || f.plan === "family" ? f.plan : "free";
    planCounts[plan]++;
    return {
      id: String(f._id),
      plan,
      active: f.active !== false,
      memberCount: (f.memberIds ?? []).length,
      childrenCount: childrenMap.get(String(f._id)) ?? 0,
      residencesCount: residencesMap.get(String(f._id)) ?? 0,
      createdAt: f.createdAt.toISOString(),
    };
  });

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-stone-900 dark:text-stone-100">Admin HomeSplit</h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm">Toate instanțele (familiile) și statistici</p>
          </div>
          <Link
            href="/"
            className="px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 text-sm font-medium hover:bg-stone-300 dark:hover:bg-stone-600"
          >
            Înapoi la app
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4">
            <p className="text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wide">Familii</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{families.length}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4">
            <p className="text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wide">Utilizatori</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{usersCount}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4">
            <p className="text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wide">Evenimente</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{eventsCount}</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4">
            <p className="text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wide">Propuneri</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{proposalsCount}</p>
          </div>
        </div>

        <div className="mb-6 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 px-4 py-3">
          <h2 className="font-semibold text-stone-800 dark:text-stone-100">Planuri</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm">Free: {planCounts.free} · Pro: {planCounts.pro} · Family+: {planCounts.family}</p>
        </div>
        <AdminFamiliesTable families={familyRows} />
      </div>
    </div>
  );
}
