import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">Confidențialitate</h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400 text-sm text-center max-w-md">
        Datele tale sunt private. Accesul la familie se face doar pe bază de invitație. Nu vindem date. Politica completă va fi publicată aici.
      </p>
      <Link href="/" className="mt-6 text-amber-600 dark:text-amber-400 font-medium hover:underline">
        Înapoi la prima pagină
      </Link>
    </div>
  );
}
