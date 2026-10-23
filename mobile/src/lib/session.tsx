import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, getToken, setToken, setUnauthorizedHandler } from "@/lib/api";
import { registerForPushNotifications, unregisterPushNotifications } from "@/lib/push";
import type { Bootstrap } from "@/lib/types";

type SessionState =
  | { status: "loading" }
  | { status: "signedOut" }
  | { status: "signedIn"; data: Bootstrap };

interface SessionContextValue {
  state: SessionState;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  /** Reîncarcă datele familiei (după modificări). */
  refresh: () => Promise<void>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<SessionState>({ status: "loading" });

  const loadBootstrap = useCallback(async () => {
    const data = await api<Bootstrap>("/api/mobile/bootstrap");
    setState({ status: "signedIn", data });
    registerForPushNotifications().catch(() => {});
  }, []);

  const signOut = useCallback(async () => {
    await unregisterPushNotifications();
    await setToken(null);
    setState({ status: "signedOut" });
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      setToken(null).finally(() => setState({ status: "signedOut" }));
    });
    (async () => {
      const token = await getToken();
      if (!token) {
        setState({ status: "signedOut" });
        return;
      }
      try {
        // Reînnoiește tokenul la fiecare pornire (rămâi conectat cât folosești aplicația).
        const { token: fresh } = await api<{ token: string }>("/api/mobile/auth/refresh", { method: "POST" });
        await setToken(fresh);
        await loadBootstrap();
      } catch {
        await setToken(null);
        setState({ status: "signedOut" });
      }
    })();
    return () => setUnauthorizedHandler(null);
  }, [loadBootstrap]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      const { token } = await api<{ token: string }>("/api/mobile/auth/login", {
        method: "POST",
        body: { email: email.trim().toLowerCase(), password },
      });
      await setToken(token);
      await loadBootstrap();
    },
    [loadBootstrap]
  );

  const value = useMemo(() => ({ state, signIn, signOut, refresh: loadBootstrap }), [state, signIn, signOut, loadBootstrap]);
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error("useSession must be used inside SessionProvider");
  return ctx;
}

/** Datele utilizatorului conectat (doar în ecranele din zona autentificată). */
export function useBootstrap(): Bootstrap {
  const { state } = useSession();
  if (state.status !== "signedIn") throw new Error("useBootstrap requires a signed-in session");
  return state.data;
}
