import type { Metadata } from "next";
import { requireAdminPage } from "@/lib/admin";
import { AdminNav } from "@/components/admin/AdminNav";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin · HomeSplit",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  // Layout-ul protejează navigația; fiecare pagină verifică și ea, pentru că se randează în paralel cu layout-ul.
  const session = await requireAdminPage();
  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <AdminNav adminEmail={session.user.email} />
      <main className="mx-auto w-full max-w-7xl px-4 pb-16 pt-5 sm:px-6">{children}</main>
    </div>
  );
}
