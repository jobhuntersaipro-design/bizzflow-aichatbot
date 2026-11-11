/** Pure helpers for the inbox sync status. Safe to import in client components. */

/** After this long with no webhook, the inbox warns that new messages may not be arriving. */
export const WEBHOOK_QUIET_MS = 6 * 60 * 60 * 1000;

export type WebhookHealth = "live" | "quiet" | "none";

export function webhookHealth(at: string | null, now: number): WebhookHealth {
  if (!at) return "none";
  return now - Date.parse(at) > WEBHOOK_QUIET_MS ? "quiet" : "live";
}

/** "just now", "45s ago", "12 min ago", "3 h ago", "10 days ago". */
export function ago(at: string | number, now: number): string {
  const s = Math.max(0, Math.round((now - (typeof at === "number" ? at : Date.parse(at))) / 1000));
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 48) return `${h} h ago`;
  return `${Math.round(h / 24)} days ago`;
}
