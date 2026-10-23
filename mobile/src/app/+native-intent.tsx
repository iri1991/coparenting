/**
 * Linkurile web (din email, notificări, Universal / App Links) se deschid în ecranul potrivit:
 * https://homesplit.ro/app… → calendar, /chat → chat, /account → cont.
 */
export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
  try {
    const pathname = path.startsWith("http") ? new URL(path).pathname : path.split("?")[0];
    if (pathname.startsWith("/chat")) return "/chat";
    if (pathname.startsWith("/account")) return "/account";
    if (pathname.startsWith("/app")) return "/";
    return path;
  } catch {
    return "/";
  }
}
