/** owner: everything. manager: settings and labels. agent: works chats. */
export const ROLES = ["owner", "manager", "agent"] as const;
export type Role = (typeof ROLES)[number];

const RANK: Record<Role, number> = { agent: 0, manager: 1, owner: 2 };

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ROLES as readonly string[]).includes(value);
}

/** True when `role` is at least `min`. */
export function hasRole(role: Role, min: Role): boolean {
  return RANK[role] >= RANK[min];
}
