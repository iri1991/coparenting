import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import type { Session } from "next-auth";
import { auth } from "@/lib/auth";
import { getDb } from "@/lib/mongodb";
import { isAdminEmail } from "@/lib/admin-emails";

export { isAdminEmail };

export type AdminSession = Session & { user: Session["user"] & { id: string; email: string } };

/** Pentru pagini server: redirect dacă nu e admin. */
export async function requireAdminPage(): Promise<AdminSession> {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");
  if (!isAdminEmail(session.user.email)) redirect("/app");
  return session as AdminSession;
}

/**
 * Pentru rute API: întoarce sesiunea sau un NextResponse cu eroare.
 * Utilizare: `const a = await requireAdminApi(); if (a instanceof NextResponse) return a;`
 */
export async function requireAdminApi(): Promise<AdminSession | NextResponse> {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  if (!isAdminEmail(session.user.email)) {
    return NextResponse.json({ error: "Doar admin." }, { status: 403 });
  }
  return session as AdminSession;
}

export interface AdminAuditEntry {
  adminEmail: string;
  action: string;
  targetType?: "user" | "family" | "invitation" | "system";
  targetId?: string;
  details?: Record<string, unknown>;
  createdAt: Date;
}

/** Înregistrează o acțiune de admin. Nu aruncă erori. */
export async function logAdminAction(
  session: AdminSession,
  action: string,
  target?: { type: AdminAuditEntry["targetType"]; id?: string },
  details?: Record<string, unknown>
): Promise<void> {
  try {
    const db = await getDb();
    const entry: AdminAuditEntry = {
      adminEmail: session.user.email,
      action,
      targetType: target?.type,
      targetId: target?.id,
      details,
      createdAt: new Date(),
    };
    await db.collection("admin_audit_log").insertOne(entry);
  } catch (e) {
    console.error("[admin] audit log failed", e);
  }
}
