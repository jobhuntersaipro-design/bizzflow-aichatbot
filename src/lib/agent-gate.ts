import { auth } from "@/auth";
import { hasRole, type Role } from "@/lib/roles";

export type SignedInAgent = { id: string; name: string; email: string; role: Role };

/** The signed-in agent, or null. */
export async function currentAgent(): Promise<SignedInAgent | null> {
  const session = await auth();
  return session?.user?.id ? session.user : null;
}

/**
 * The gate every Server Action starts with. Not a "use server" file, so
 * exporting it does not make it a POST-able action.
 */
export async function requireAgent(
  min: Role = "agent",
): Promise<{ agent: SignedInAgent; denied: null } | { agent: null; denied: { success: false; error: string } }> {
  const agent = await currentAgent();
  if (!agent) return { agent: null, denied: { success: false, error: "Sign in again." } };
  if (!hasRole(agent.role, min)) return { agent: null, denied: { success: false, error: "Your role cannot do this." } };
  return { agent, denied: null };
}
