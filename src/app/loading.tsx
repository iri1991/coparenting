import Image from "next/image";

export default function Loading() {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-gradient-to-b from-amber-50 via-orange-50 to-stone-100 dark:from-stone-950 dark:via-stone-900 dark:to-stone-950">
      <div className="relative flex flex-col items-center">
        <div className="absolute inset-0 -z-10 blur-2xl">
          <div className="h-24 w-24 rounded-full bg-amber-400/35 dark:bg-amber-500/30 animate-splash-pulse" />
        </div>
        <div className="animate-splash-float rounded-3xl border border-white/50 dark:border-stone-700/80 bg-white/70 dark:bg-stone-900/70 backdrop-blur-xl shadow-2xl p-4">
          <Image
            src="/logo.png"
            alt="HomeSplit"
            width={72}
            height={72}
            className="object-contain"
            priority
          />
        </div>
        <p className="mt-4 text-sm font-medium tracking-wide text-stone-600 dark:text-stone-300">
          HomeSplit
        </p>
      </div>
    </div>
  );
}
