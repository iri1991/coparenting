import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getDb } from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { AdminFamiliesTable } from "@/components/AdminFamiliesTable";
import { AdminUsersTable } from "@/components/AdminUsersTable";
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
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [families, usersCount, eventsCount, proposalsCount, newFamiliesLast30, newUsersLast30] = await Promise.all([
    db.collection("families").find({}).sort({ createdAt: -1 }).toArray(),
    db.collection("users").countDocuments(),
    db.collection("schedule_events").countDocuments(),
    db.collection("schedule_proposals").countDocuments(),
    db.collection("families").countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    db.collection("users").countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  const familyIds = (families as { _id: ObjectId }[]).map((f) => f._id);
  const [childrenPerFamily, residencesPerFamily] = await Promise.all([
    db.collection("children").aggregate([{ $match: { familyId: { $in: familyIds } } }, { $group: { _id: "$familyId", count: { $sum: 1 } } }]).toArray(),
    db.collection("residences").aggregate([{ $match: { familyId: { $in: familyIds } } }, { $group: { _id: "$familyId", count: { $sum: 1 } } }]).toArray(),
  ]);
  const childrenMap = new Map((childrenPerFamily as { _id: ObjectId; count: number }[]).map((x) => [String(x._id), x.count]));
  const residencesMap = new Map((residencesPerFamily as { _id: ObjectId; count: number }[]).map((x) => [String(x._id), x.count]));

  const planCounts = { free: 0, pro: 0, family: 0 };
  const familyRows = (
    families as {
      _id: ObjectId;
      plan?: string;
      memberIds?: string[];
      active?: boolean;
      createdAt: Date;
      stripeCustomerId?: string;
      stripeSubscriptionId?: string;
      subscriptionStatus?: string;
      currentPeriodEnd?: string;
    }[]
  ).map((f) => {
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
      stripeCustomerId: f.stripeCustomerId ?? null,
      stripeSubscriptionId: f.stripeSubscriptionId ?? null,
      subscriptionStatus: f.subscriptionStatus ?? null,
      currentPeriodEnd: f.currentPeriodEnd ?? null,
    };
  });

  const users = (await db.collection("users").find({}).sort({ createdAt: -1 }).toArray()) as {
    _id: ObjectId;
    email?: string;
    name?: string;
    familyId?: ObjectId;
    createdAt?: Date;
  }[];
  const familyById = new Map(familyRows.map((r) => [r.id, r]));
  const activeFamiliesCount = familyRows.filter((f) => f.active).length;
  const userRows = users.map((u) => {
    const fid = u.familyId ? String(u.familyId) : null;
    const fam = fid ? familyById.get(fid) : null;
    return {
      id: String(u._id),
      email: u.email ?? "",
      name: u.name ?? "",
      familyId: fid,
      plan: fam?.plan ?? "free",
      subscriptionStatus: fam?.subscriptionStatus ?? null,
      currentPeriodEnd: fam?.currentPeriodEnd ?? null,
      stripeCustomerId: fam?.stripeCustomerId ?? null,
      createdAt: u.createdAt ? u.createdAt.toISOString() : null,
    };
  });

  return (
    <div className="min-h-screen bg-stone-100 dark:bg-stone-950 p-6">
      <div className="max-w-7xl mx-auto">
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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-4">
          <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4">
            <p className="text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wide">Familii</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{families.length}</p>
            <p className="text-stone-400 text-xs mt-1">{activeFamiliesCount} active · +{newFamiliesLast30} în 30 zile</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 p-4">
            <p className="text-stone-500 dark:text-stone-400 text-xs uppercase tracking-wide">Utilizatori</p>
            <p className="text-2xl font-bold text-stone-900 dark:text-stone-100">{usersCount}</p>
            <p className="text-stone-400 text-xs mt-1">+{newUsersLast30} în 30 zile</p>
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
          <h2 className="font-semibold text-stone-800 dark:text-stone-100 mb-1">Distribuție planuri</h2>
          <div className="flex gap-6 text-sm">
            <span className="text-stone-500 dark:text-stone-400">
              Free: <span className="font-semibold text-stone-800 dark:text-stone-100">{planCounts.free}</span>
            </span>
            <span className="text-stone-500 dark:text-stone-400">
              Pro: <span className="font-semibold text-amber-600 dark:text-amber-400">{planCounts.pro}</span>
            </span>
            <span className="text-stone-500 dark:text-stone-400">
              Family+: <span className="font-semibold text-emerald-600 dark:text-emerald-400">{planCounts.family}</span>
            </span>
            {families.length > 0 && (
              <span className="text-stone-400 text-xs self-center">
                {Math.round(((planCounts.pro + planCounts.family) / families.length) * 100)}% plătitor
              </span>
            )}
          </div>
        </div>
        <AdminFamiliesTable families={familyRows} />
        <div className="mt-8">
          <AdminUsersTable users={userRows} />
        </div>
      </div>
    </div>
  );
}
