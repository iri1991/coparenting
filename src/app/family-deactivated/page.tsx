import Image from "next/image";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function FamilyDeactivatedPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  if (!session.user.familyId) {
    redirect("/setup");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <div className="max-w-sm w-full text-center space-y-6">
        <Link href="/" className="block">
          <Image src="/logo.png" alt="HomeSplit" width={64} height={64} className="rounded-2xl object-contain mx-auto" />
        </Link>
        <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">
          Cont dezactivat
        </h1>
        <p className="text-stone-600 dark:text-stone-400 text-sm">
          Familia asociată contului tău a fost dezactivată. Nu poți accesa calendarul, configurarea sau mesajele până la reactivare.
        </p>
        <p className="text-stone-500 dark:text-stone-500 text-sm">
          Pentru detalii sau reactivare, contactează suportul (ex. me@irinelnicoara.ro).
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center w-full py-3 px-4 rounded-xl bg-stone-200 dark:bg-stone-700 text-stone-800 dark:text-stone-200 font-medium hover:bg-stone-300 dark:hover:bg-stone-600 transition"
        >
          Înapoi la start
        </Link>
      </div>
    </div>
  );
}
