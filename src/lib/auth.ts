import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";
import { isAdminEmail } from "@/lib/admin-emails";
import { clearAttempts, countAttempts, recordAttempt } from "@/lib/rate-limit";

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const LOGIN_MAX_FAILURES = 10;

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Parolă", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = (credentials.email as string).toLowerCase().trim();
        // Limită de încercări greșite per email (anti brute-force).
        const limitKey = `login:${email}`;
        if ((await countAttempts(limitKey, LOGIN_WINDOW_MS)) >= LOGIN_MAX_FAILURES) return null;
        const db = await getDb();
        const user = await db.collection("users").findOne({ email });
        if (!user?.passwordHash) {
          await recordAttempt(limitKey, LOGIN_WINDOW_MS);
          return null;
        }
        const ok = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!ok) {
          await recordAttempt(limitKey, LOGIN_WINDOW_MS);
          return null;
        }
        await clearAttempts(limitKey).catch(() => {});
        return {
          id: String(user._id),
          email: user.email,
          name: (user as { name?: string }).name ?? undefined,
          parentType: (user as { parentType?: "tata" | "mama" }).parentType ?? undefined,
          familyId: (user as { familyId?: unknown }).familyId != null ? String((user as { familyId?: unknown }).familyId) : undefined,
        };
      },
    }),
  ],
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
  pages: { signIn: "/login" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.parentType = user.parentType;
        token.familyId = (user as { familyId?: string }).familyId;
        // Momentul autentificării (nu `iat`, care se reînnoiește la fiecare reîmprospătare a cookie-ului).
        token.authAt = Date.now();
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        const db = await getDb();
        const u = await db.collection("users").findOne(
          { _id: new ObjectId(token.id as string) },
          { projection: { familyId: 1, lastActiveDateKey: 1, passwordChangedAt: 1 } }
        );
        // Cont șters sau parolă schimbată după emiterea sesiunii → sesiunea nu mai e validă.
        const changedAt = (u as { passwordChangedAt?: Date } | null)?.passwordChangedAt;
        const authAt = typeof token.authAt === "number" ? token.authAt : 0;
        if (!u || (changedAt && changedAt.getTime() > authAt)) {
          session.user.id = "";
          session.user.familyId = null;
          session.user.isAdmin = false;
          return session;
        }
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | undefined;
        session.user.parentType = token.parentType as "tata" | "mama" | undefined;
        session.user.isAdmin = isAdminEmail(session.user.email);
        const fid = (u as { familyId?: unknown })?.familyId;
        session.user.familyId = fid != null ? String(fid) : null;
        // Actualizează lastActiveAt cel mult o dată pe zi
        const today = new Date().toISOString().slice(0, 10);
        if ((u as { lastActiveDateKey?: string })?.lastActiveDateKey !== today) {
          db.collection("users").updateOne(
            { _id: new ObjectId(token.id as string) },
            { $set: { lastActiveAt: new Date(), lastActiveDateKey: today } }
          ).catch(() => {});
        }
      }
      return session;
    },
  },
};

export async function auth() {
  return getServerSession(authOptions);
}

declare module "next-auth" {
  interface User {
    parentType?: "tata" | "mama";
    familyId?: string;
  }
  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      parentType?: "tata" | "mama" | null;
      familyId?: string | null;
      isAdmin?: boolean;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    parentType?: "tata" | "mama";
    authAt?: number;
    familyId?: string | null;
  }
}
