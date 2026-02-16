import type { NextAuthOptions } from "next-auth";
import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { getServerSession } from "next-auth/next";
import { ObjectId } from "mongodb";
import { getDb } from "@/lib/mongodb";
import bcrypt from "bcryptjs";

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
        const db = await getDb();
        const user = await db.collection("users").findOne({
          email: (credentials.email as string).toLowerCase().trim(),
        });
        if (!user?.passwordHash) return null;
        const ok = await bcrypt.compare(
          credentials.password as string,
          user.passwordHash
        );
        if (!ok) return null;
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
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string | undefined;
        session.user.parentType = token.parentType as "tata" | "mama" | undefined;
        session.user.isAdmin = (session.user.email ?? "").toLowerCase() === "me@irinelnicoara.ro";
        const db = await getDb();
        const u = await db.collection("users").findOne(
          { _id: new ObjectId(token.id as string) },
          { projection: { familyId: 1 } }
        );
        const fid = (u as { familyId?: unknown })?.familyId;
        session.user.familyId = fid != null ? String(fid) : null;
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
    familyId?: string | null;
  }
}
