import { redirect } from "next/navigation";
import { AgentsTable } from "@/components/agents/agents-table";
import { currentAgent } from "@/lib/agent-gate";
import { prisma } from "@/lib/prisma";
import { hasRole } from "@/lib/roles";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const me = await currentAgent();
  if (!me || !hasRole(me.role, "owner")) redirect("/inbox");
  const agents = await prisma.agent.findMany({
    select: { id: true, name: true, email: true, role: true, active: true, lastLoginAt: true },
    orderBy: [{ active: "desc" }, { name: "asc" }],
  });
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      <h1 className="text-xl font-semibold text-ink">Agents</h1>
      <AgentsTable
        meId={me.id}
        agents={agents.map((a) => ({ ...a, lastLoginAt: a.lastLoginAt?.toISOString() ?? null }))}
      />
    </div>
  );
}
