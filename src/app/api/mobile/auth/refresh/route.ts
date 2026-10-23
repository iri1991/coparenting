import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { decode } from "next-auth/jwt";
import { auth, issueMobileToken } from "@/lib/auth";

/** POST (Bearer): reînnoiește tokenul aplicației, păstrând momentul autentificării. */
export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Neautorizat" }, { status: 401 });
  }
  const raw = ((await headers()).get("authorization") ?? "").replace(/^Bearer\s+/, "");
  const old = await decode({ token: raw, secret: process.env.NEXTAUTH_SECRET! }).catch(() => null);
  if (!old?.mobile) {
    return NextResponse.json({ error: "Token invalid." }, { status: 401 });
  }
  const token = await issueMobileToken(
    {
      id: session.user.id,
      email: session.user.email ?? "",
      name: session.user.name ?? undefined,
      parentType: session.user.parentType ?? undefined,
      familyId: session.user.familyId ?? undefined,
    },
    typeof old.authAt === "number" ? old.authAt : Date.now()
  );
  return NextResponse.json({ token });
}
