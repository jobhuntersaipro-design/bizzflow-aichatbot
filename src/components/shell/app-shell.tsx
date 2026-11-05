import Link from "next/link";
import { signOut } from "@/auth";
import type { SignedInAgent } from "@/lib/agent-gate";
import { hasRole } from "@/lib/roles";

export function AppShell({ agent, children }: { agent: SignedInAgent; children: React.ReactNode }) {
  const nav = [{ href: "/inbox", label: "Inbox" }];
  if (hasRole(agent.role, "owner")) nav.push({ href: "/agents", label: "Agents" });

  async function logout() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div className="flex min-h-screen flex-col bg-wash">
      <header className="flex h-14 items-center gap-6 border-b border-line bg-card px-4 md:px-8">
        <span className="text-sm font-semibold text-ink">BizzFlow AI Chatbot</span>
        <nav className="flex gap-4">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="text-sm text-ink-soft hover:text-ink">
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm text-ink-muted sm:inline">
            {agent.name} · {agent.role}
          </span>
          <form action={logout}>
            <button type="submit" className="text-sm text-ink-soft hover:text-ink">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-8">{children}</main>
    </div>
  );
}
