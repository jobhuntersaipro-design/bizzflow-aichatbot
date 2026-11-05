import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { isRole, type Role } from "@/lib/roles";
import { MIN_PASSWORD } from "@/lib/agent-rules";
import authConfig from "./auth.config";

/** This email becomes the owner on its first sign-in, but only while no agent exists. */
export const BOOTSTRAP_OWNER_EMAIL = "jobhunters.ai.pro@gmail.com";

/** Creates the first owner with the typed password. Returns null once any agent exists. */
async function claimFirstOwner(email: string, password: string) {
  if (email !== BOOTSTRAP_OWNER_EMAIL || password.length < MIN_PASSWORD) return null;
  if ((await prisma.agent.count()) > 0) return null;
  return prisma.agent.create({
    data: { email, name: "Kim", role: "owner", passwordHash: await bcrypt.hash(password, 12) },
  });
}

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
        const agent =
          (await prisma.agent.findUnique({ where: { email } })) ?? (await claimFirstOwner(email, password));
        if (!agent?.active) return null;
        if (!(await bcrypt.compare(password, agent.passwordHash))) return null;
        await prisma.agent.update({ where: { id: agent.id }, data: { lastLoginAt: new Date() } });
        return { id: agent.id, name: agent.name, email: agent.email, role: isRole(agent.role) ? agent.role : "agent" };
      },
    }),
  ],
});
