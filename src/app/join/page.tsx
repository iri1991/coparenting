import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { JoinClient } from "@/components/JoinClient";
import { getDb } from "@/lib/mongodb";

/** Emailul invitat (doar pentru invitații valide), ca să precompletăm formularul. */
async function getInvitedEmail(token: string | undefined): Promise<string | null> {
  if (!token) return null;
  const db = await getDb();
  const inv = await db
    .collection("invitations")
    .findOne({ token, status: "pending", expiresAt: { $gt: new Date() } }, { projection: { email: 1 } });
  return (inv as { email?: string } | null)?.email ?? null;
}

export default async function JoinPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const session = await auth();
  const params = await searchParams;
  const token = params.token?.trim();
  const invitedEmail = await getInvitedEmail(token);

  if (!session?.user?.id) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
        <div className="w-full max-w-sm space-y-6 text-center flex flex-col items-center">
          <Link href="/">
            <Image src="/logo.png" alt="HomeSplit" width={64} height={64} className="rounded-2xl object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Invitație în familie
          </h1>
          <p className="text-stone-600 dark:text-stone-400 text-sm">
            Conectează-te sau creează un cont pentru a accepta invitația.
          </p>
          <JoinClient token={token || ""} isLoggedIn={false} invitedEmail={invitedEmail} />
        </div>
      </div>
    );
  }

  // Logat cu alt cont decât cel invitat: arătăm explicația (chiar dacă acest cont are deja familie).
  const emailMismatch =
    !!invitedEmail && (session.user.email ?? "").toLowerCase() !== invitedEmail.toLowerCase();

  if (session.user.familyId && !emailMismatch) {
    redirect("/app");
  }

  if (!token) {
    redirect("/setup");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="HomeSplit" width={64} height={64} className="rounded-2xl object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Acceptă invitația
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400 text-sm">
            Vei fi adăugat în familia celuilalt părinte.
          </p>
        </div>
        <JoinClient
          token={token}
          isLoggedIn={true}
          invitedEmail={invitedEmail}
          currentEmail={session.user.email ?? null}
        />
      </div>
    </div>
  );
}
