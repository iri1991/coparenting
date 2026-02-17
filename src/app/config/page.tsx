import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ConfigClient } from "@/components/ConfigClient";
import { SubscriptionSection } from "@/components/SubscriptionSection";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { isStripeConfigured } from "@/lib/stripe";
import { ObjectId } from "mongodb";

export default async function ConfigPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!session.user.familyId) {
    redirect("/setup");
  }
  const params = await searchParams;
  const planParam = params?.plan;
  const pendingPlan = planParam === "pro" || planParam === "family" ? planParam : undefined;
  const db = await getDb();
  const familyId = new ObjectId(session.user.familyId);
  const family = await getActiveFamily(db, familyId);
  if (!family) {
    redirect("/family-deactivated");
  }
  const [children, residences] = await Promise.all([
    db.collection("children").find({ familyId }).sort({ createdAt: 1 }).toArray(),
    db.collection("residences").find({ familyId }).sort({ order: 1, createdAt: 1 }).toArray(),
  ]);
  const familyData = {
    id: String(family._id),
    parent1Name: (family as { parent1Name?: string }).parent1Name ?? "",
    parent2Name: (family as { parent2Name?: string }).parent2Name ?? "",
    name: (family as { name?: string }).name ?? "",
  };
  const memberCount = ((family as { memberIds?: unknown[] }).memberIds || []).length;
  const plan = (family as { plan?: string }).plan === "pro" || (family as { plan?: string }).plan === "family" ? (family as { plan: "pro" | "family" }).plan : "free";
  const stripeConfigured = isStripeConfigured();
  const subscriptionStatus = (family as { subscriptionStatus?: string }).subscriptionStatus ?? null;
  const currentPeriodEnd = (family as { currentPeriodEnd?: string }).currentPeriodEnd ?? null;
  const childrenData = (children as { _id: unknown; name: string; allergies?: string; travelDocuments?: { id: string; name: string }[]; notes?: string }[]).map((c) => ({
    id: String(c._id),
    name: c.name,
    allergies: c.allergies ?? "",
    travelDocuments: Array.isArray(c.travelDocuments) ? c.travelDocuments : [],
    notes: c.notes ?? "",
  }));
  const residencesData = (residences as { _id: unknown; name: string }[]).map((r) => ({ id: String(r._id), name: r.name }));
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <div className="max-w-md mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/" className="shrink-0 rounded-xl hover:opacity-90 transition-opacity">
            <Image src="/logo.png" alt="HomeSplit" width={40} height={40} className="rounded-xl object-contain" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
              Configurare familie
            </h1>
            <p className="text-stone-500 dark:text-stone-400 text-sm">
              Nume copii, nume părinți, locuințe. Doar membrii familiei văd aceste date.
            </p>
          </div>
        </div>
        <SubscriptionSection
          plan={plan}
          stripeConfigured={stripeConfigured}
          currentPeriodEnd={currentPeriodEnd}
          subscriptionStatus={subscriptionStatus}
        />
        <ConfigClient
          initialFamily={familyData}
          initialChildren={childrenData}
          initialResidences={residencesData}
          memberCount={memberCount}
          currentUserId={session.user.id}
          plan={plan}
          returnToHref={pendingPlan ? `/?plan=${pendingPlan}` : "/"}
        />
      </div>
    </div>
  );
}
