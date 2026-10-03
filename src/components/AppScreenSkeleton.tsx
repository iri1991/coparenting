import { MobileQuickNav } from "@/components/MobileQuickNav";

/**
 * Schelet afișat instant la navigare (loading.tsx), până vin datele de pe server.
 * Păstrează „rama” aplicației (bara de jos, header) ca trecerea să pară nativă.
 */
export function AppScreenSkeleton({ variant }: { variant: "home" | "account" | "chat" }) {
  if (variant === "chat") {
    return (
      <div className="fixed inset-0 z-30 flex flex-col bg-[#f6f0e8]" aria-busy="true" aria-label="Se încarcă">
        <div className="shrink-0 border-b border-[#eadccd] bg-white/85 pt-[env(safe-area-inset-top)]">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="app-skeleton h-10 w-10 rounded-full" />
            <div className="app-skeleton h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <div className="app-skeleton h-3.5 w-28 rounded-full" />
              <div className="app-skeleton h-3 w-40 rounded-full" />
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-3 overflow-hidden px-3 py-4">
          {[60, 45, 70, 35, 55, 40].map((w, i) => (
            <div key={i} className={`flex ${i % 3 === 2 ? "justify-start" : i % 2 ? "justify-end" : "justify-start"}`}>
              <div className="app-skeleton h-10 rounded-[20px]" style={{ width: `${w}%` }} />
            </div>
          ))}
        </div>
        <div className="shrink-0 border-t border-[#eadccd] bg-white/90 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
          <div className="app-skeleton h-[42px] rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="app-native-shell min-h-screen" aria-busy="true" aria-label="Se încarcă">
      <div className="sm:hidden fixed inset-x-0 top-0 z-[45] px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <div className="mx-auto max-w-md">
          <div className="app-native-glass flex h-[64px] items-center justify-between rounded-[28px] px-3">
            <div className="app-skeleton h-11 w-11 rounded-2xl" />
            <div className="app-skeleton h-6 w-32 rounded-full" />
            <div className="app-skeleton h-11 w-11 rounded-2xl" />
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-5xl space-y-4 px-4 pb-32 pt-24 sm:pt-8">
        {variant === "home" ? (
          <>
            <div className="app-skeleton h-6 w-48 rounded-full" />
            <div className="app-skeleton h-12 rounded-[2rem]" />
            <div className="app-native-surface rounded-[2rem] p-4">
              <div className="mx-auto mb-4 h-5 w-32 rounded-full app-skeleton" />
              <div className="grid grid-cols-7 gap-1.5">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="app-skeleton aspect-square rounded-xl" />
                ))}
              </div>
            </div>
            <div className="app-skeleton h-28 rounded-[2rem]" />
          </>
        ) : (
          <>
            <div className="app-skeleton h-12 rounded-[1.6rem]" />
            <div className="app-skeleton h-40 rounded-[2rem]" />
            <div className="app-skeleton h-56 rounded-[2rem]" />
          </>
        )}
      </div>
      <MobileQuickNav />
    </div>
  );
}
