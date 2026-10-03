import { requireAdminPage } from "@/lib/admin";
import Link from "next/link";
import { getAdminAuditLog } from "@/lib/admin-data";
import { isPushConfigured } from "@/lib/push";
import { Card, fmtDate } from "@/components/admin/ui";
import { BroadcastPanel, CronJobsPanel } from "@/components/admin/AdminTools";

function targetHref(type: string | null, id: string | null): string | null {
  if (!id) return null;
  if (type === "family") return `/admin/families/${id}`;
  if (type === "user") return `/admin/users?q=${encodeURIComponent(id)}`;
  return null;
}

export default async function AdminToolsPage() {
  await requireAdminPage();
  const audit = await getAdminAuditLog(100);
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold">Unelte</h1>
        <p className="text-sm text-stone-500">Job-uri programate, comunicare cu utilizatorii și jurnalul acțiunilor de admin.</p>
      </div>
      <div className="grid gap-5 lg:grid-cols-2">
        <BroadcastPanel pushConfigured={isPushConfigured()} />
        <CronJobsPanel />
      </div>
      <div id="audit">
        <Card title="Jurnal acțiuni admin" subtitle="Ultimele 100 de acțiuni">
          {audit.length === 0 ? (
            <p className="text-sm text-stone-400">Nicio acțiune înregistrată.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-xs text-stone-500">
                  <tr>
                    <th className="py-2 pr-3 text-left font-medium">Când</th>
                    <th className="py-2 pr-3 text-left font-medium">Acțiune</th>
                    <th className="py-2 pr-3 text-left font-medium">Țintă</th>
                    <th className="py-2 pr-3 text-left font-medium">Detalii</th>
                    <th className="py-2 text-left font-medium">Admin</th>
                  </tr>
                </thead>
                <tbody>
                  {audit.map((a) => {
                    const href = targetHref(a.targetType, a.targetId);
                    return (
                      <tr key={a.id} className="border-t border-stone-100 align-top dark:border-stone-800">
                        <td className="whitespace-nowrap py-2 pr-3 text-xs text-stone-500">{fmtDate(a.createdAt, "d MMM, HH:mm")}</td>
                        <td className="py-2 pr-3 font-medium">{a.action}</td>
                        <td className="py-2 pr-3 text-xs">
                          {href ? (
                            <Link href={href} className="text-amber-700 hover:underline dark:text-amber-400">
                              {a.targetType} {a.targetId?.slice(-6)}
                            </Link>
                          ) : (
                            a.targetType ?? "—"
                          )}
                        </td>
                        <td className="max-w-md py-2 pr-3">
                          {a.details && <code className="block truncate text-[11px] text-stone-500" title={JSON.stringify(a.details)}>{JSON.stringify(a.details)}</code>}
                        </td>
                        <td className="whitespace-nowrap py-2 text-xs text-stone-500">{a.adminEmail}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
