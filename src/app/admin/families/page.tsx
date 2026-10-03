import { requireAdminPage } from "@/lib/admin";
import { getAdminFamilies } from "@/lib/admin-data";
import { AdminFamiliesTable } from "@/components/AdminFamiliesTable";

export default async function AdminFamiliesPage() {
  await requireAdminPage();
  const families = await getAdminFamilies();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Familii</h1>
        <p className="text-sm text-stone-500">Click pe o familie pentru detalii complete, plan, membri, invitații, note și notificări.</p>
      </div>
      <AdminFamiliesTable families={families} />
    </div>
  );
}
