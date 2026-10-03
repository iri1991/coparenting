/** Adminul implicit; se pot adăuga alții prin env ADMIN_EMAILS (separați prin virgulă). */
const DEFAULT_ADMIN_EMAIL = "me@irinelnicoara.ro";

function adminEmails(): Set<string> {
  const extra = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
  return new Set([DEFAULT_ADMIN_EMAIL, ...extra]);
}

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return adminEmails().has(email.toLowerCase().trim());
}
