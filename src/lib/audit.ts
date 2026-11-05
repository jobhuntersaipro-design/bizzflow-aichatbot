import { prisma } from "@/lib/prisma";

/** Append-only. A failed write is logged and swallowed, so an audit outage never blocks the inbox. */
export async function recordAudit(entry: { agentId: string | null; action: string; detail: string }): Promise<void> {
  try {
    await prisma.auditLog.create({ data: entry });
  } catch (e) {
    console.error("[audit] write failed", e);
  }
}
