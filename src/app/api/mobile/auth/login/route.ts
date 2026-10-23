import { NextResponse } from "next/server";
import { issueMobileToken, verifyCredentials } from "@/lib/auth";

/** POST { email, password } → { token } pentru aplicația mobilă (folosit ca `Authorization: Bearer`). */
export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body.email === "string" ? body.email : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!email || !password) {
    return NextResponse.json({ error: "Email și parola sunt obligatorii." }, { status: 400 });
  }
  const user = await verifyCredentials(email, password);
  if (!user) {
    return NextResponse.json({ error: "Email sau parolă incorectă." }, { status: 401 });
  }
  const token = await issueMobileToken(user);
  return NextResponse.json({ token, user: { id: user.id, email: user.email, name: user.name ?? null } });
}
