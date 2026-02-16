import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import { getActiveFamily } from "@/lib/family";
import { AccountPageShell, type ConfigData } from "@/components/AccountPageShell";

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  let configData: ConfigData | null = null;

  if (session.user.familyId) {
    const db = await getDb();
    const familyId = new ObjectId(session.user.familyId);
    const family = await getActiveFamily(db, familyId);
    if (family) {
      const [children, residences] = await Promise.all([
        db.collection("children").find({ familyId }).sort({ createdAt: 1 }).toArray(),
        db.collection("residences").find({ familyId }).sort({ order: 1, createdAt: 1 }).toArray(),
      ]);
      const familyData = family as { _id: unknown; parent1Name?: string; parent2Name?: string; name?: string; memberIds?: unknown[]; plan?: string };
      const plan = familyData.plan === "pro" || familyData.plan === "family" ? familyData.plan : "free";
      configData = {
        initialFamily: {
          id: String(family._id),
          parent1Name: familyData.parent1Name ?? "",
          parent2Name: familyData.parent2Name ?? "",
          name: familyData.name ?? "",
        },
        plan,
        initialChildren: (children as { _id: unknown; name: string; allergies?: string; travelDocuments?: { id: string; name: string }[]; notes?: string }[]).map((c) => ({
          id: String(c._id),
          name: c.name,
          allergies: c.allergies ?? "",
          travelDocuments: Array.isArray(c.travelDocuments) ? c.travelDocuments : [],
          notes: c.notes ?? "",
        })),
        initialResidences: (residences as { _id: unknown; name: string }[]).map((r) => ({ id: String(r._id), name: r.name })),
        memberCount: (familyData.memberIds || []).length,
      };
    }
  }

  return (
    <AccountPageShell
      initialEmail={session.user.email ?? ""}
      initialName={session.user.name ?? ""}
      initialParentType={session.user.parentType ?? null}
      configData={configData}
      currentUserId={session.user.id}
    />
  );
}
