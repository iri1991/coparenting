import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-stone-50 dark:bg-stone-950 flex flex-col items-center justify-center p-6">
      <h1 className="text-xl font-bold text-stone-800 dark:text-stone-100">Termeni și condiții</h1>
      <p className="mt-2 text-stone-500 dark:text-stone-400 text-sm text-center max-w-md">
        Conținutul va fi adăugat aici. Până atunci, te rugăm să folosești aplicația în conformitate cu politicile de confidențialitate.
      </p>
      <Link href="/" className="mt-6 text-amber-600 dark:text-amber-400 font-medium hover:underline">
        Înapoi la prima pagină
      </Link>
    </div>
  );
}
