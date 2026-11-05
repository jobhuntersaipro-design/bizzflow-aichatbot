import { isRole, type Role } from "@/lib/roles";

export const MIN_PASSWORD = 10;

export type AgentInput = { name: string; email: string; role: Role; password: string };

/** Checks a new agent. Returns the cleaned input, or the first problem in words. */
export function checkAgentInput(raw: { name: unknown; email: unknown; role: unknown; password: unknown }):
  | { ok: true; value: AgentInput }
  | { ok: false; error: string } {
  const name = String(raw.name ?? "").trim().replace(/\s+/g, " ");
  const email = String(raw.email ?? "").trim().toLowerCase();
  const password = String(raw.password ?? "");
  if (!name || name.length > 80) return { ok: false, error: "Enter a name (max 80 characters)." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: "Enter a valid email." };
  if (!isRole(raw.role)) return { ok: false, error: "Pick a role." };
  if (password.length < MIN_PASSWORD) return { ok: false, error: `The password needs at least ${MIN_PASSWORD} characters.` };
  return { ok: true, value: { name, email, role: raw.role, password } };
}
