import Image from "next/image";
import Link from "next/link";

interface AuthPageShellProps {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export function AuthPageShell({ title, subtitle, children, footer }: AuthPageShellProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-amber-50 to-orange-50 dark:from-stone-950 dark:to-stone-900">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center flex flex-col items-center gap-3">
          <Link href="/" className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400">
            <Image src="/logo.png" alt="HomeSplit" width={72} height={72} className="rounded-2xl object-contain" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100">{title}</h1>
            <p className="mt-1.5 text-stone-600 dark:text-stone-400 text-sm leading-relaxed">{subtitle}</p>
          </div>
        </div>
        {children}
        {footer ?? (
          <p className="text-center text-stone-500 text-sm">
            <Link href="/" className="text-amber-600 dark:text-amber-400 hover:underline">
              Înapoi la pagina principală
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
