"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAgent } from "@/lib/agent-gate";
import { checkAgentInput } from "@/lib/agent-rules";
import { recordAudit } from "@/lib/audit";
import { isRole } from "@/lib/roles";

type Result = { success: true } | { success: false; error: string };

export async function createAgent(input: { name: string; email: string; role: string; password: string }): Promise<Result> {
  const { agent, denied } = await requireAgent("owner");
  if (denied) return denied;
  const checked = checkAgentInput(input);
  if (!checked.ok) return { success: false, error: checked.error };
  const { name, email, role, password } = checked.value;
  try {
    await prisma.agent.create({ data: { name, email, role, passwordHash: await bcrypt.hash(password, 12) } });
  } catch {
    return { success: false, error: "An agent with that email already exists." };
  }
  await recordAudit({ agentId: agent.id, action: "agent_created", detail: `Added ${email} as ${role}.` });
  revalidatePath("/agents");
  return { success: true };
}

/** Change role or turn an account off. An owner cannot demote or turn off themselves. */
export async function updateAgent(id: string, patch: { role?: string; active?: boolean }): Promise<Result> {
  const { agent, denied } = await requireAgent("owner");
  if (denied) return denied;
  if (id === agent.id) return { success: false, error: "You cannot change your own account here." };
  if (patch.role !== undefined && !isRole(patch.role)) return { success: false, error: "Unknown role." };
  const target = await prisma.agent.update({
    where: { id },
    data: { ...(patch.role !== undefined ? { role: patch.role } : {}), ...(patch.active !== undefined ? { active: patch.active } : {}) },
    select: { email: true },
  });
  const what = [patch.role !== undefined ? `role ${patch.role}` : null, patch.active !== undefined ? (patch.active ? "turned on" : "turned off") : null]
    .filter(Boolean)
    .join(", ");
  await recordAudit({ agentId: agent.id, action: "agent_updated", detail: `${target.email}: ${what}.` });
  revalidatePath("/agents");
  return { success: true };
}
