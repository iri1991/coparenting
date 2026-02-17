import Image from "next/image";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { SetupClient } from "@/components/SetupClient";

export default async function SetupPage({
  searchParams,
}: {
  searchParams: Promise<{ plan?: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  const params = await searchParams;
  const planParam = params?.plan;
  if (session.user.familyId) {
    redirect(planParam ? `/?plan=${planParam}` : "/");
  }
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/">
            <Image src="/logo.png" alt="HomeSplit" width={64} height={64} className="rounded-2xl object-contain" />
          </Link>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">
            Configurare familie
          </h1>
          <p className="mt-2 text-stone-600 dark:text-stone-400 text-sm">
            Creează un cerc de coparenting sau intră cu o invitație de la celălalt părinte.
          </p>
        </div>
        <SetupClient pendingPlan={planParam === "pro" || planParam === "family" ? planParam : undefined} />
        <p className="text-center text-stone-500 text-sm">
          <Link href="/api/auth/signout" className="text-amber-600 hover:underline">
            Deconectare
          </Link>
        </p>
      </div>
    </div>
  );
}
