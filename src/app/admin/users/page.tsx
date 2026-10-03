import { requireAdminPage } from "@/lib/admin";
import { getAdminUsers } from "@/lib/admin-data";
import { AdminUsersTable } from "@/components/AdminUsersTable";

export default async function AdminUsersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireAdminPage();
  const [users, sp] = await Promise.all([getAdminUsers(), searchParams]);
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Utilizatori</h1>
        <p className="text-sm text-stone-500">Caută, filtrează și acționează pe conturi: resetare parolă, notificare test, scoatere din familie, ștergere.</p>
      </div>
      <AdminUsersTable users={users} initialQuery={typeof sp.q === "string" ? sp.q : ""} />
    </div>
  );
}
