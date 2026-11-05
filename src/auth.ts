import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRole, type Role } from "@/lib/roles";
import authConfig from "./auth.config";

declare module "next-auth" {
  interface Session {
    user: { id: string; name: string; email: string; role: Role };
  }
  interface User {
    role?: Role;
  }
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      session.user.id = token.id as string;
      session.user.role = isRole(token.role) ? token.role : "agent";
      return session;
    },
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").trim().toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;
        const agent = await prisma.agent.findUnique({ where: { email } });
        if (!agent?.active) return null;
        if (!(await bcrypt.compare(password, agent.passwordHash))) return null;
        await prisma.agent.update({ where: { id: agent.id }, data: { lastLoginAt: new Date() } });
        return { id: agent.id, name: agent.name, email: agent.email, role: isRole(agent.role) ? agent.role : "agent" };
      },
    }),
  ],
});
