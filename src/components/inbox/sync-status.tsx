"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Check, Loader2, RefreshCw, WifiOff } from "lucide-react";
import { Badge } from "@/components/arc/components/badge/badge";
import { Button } from "@/components/ui/button";
import { ago, webhookHealth } from "@/lib/whatsapp-sync";

/**
 * Tells the agent two separate facts:
 * 1. Is this page pulling the latest chats from our database? (the poll)
 * 2. Is WhatsApp (Dualhook) still delivering new events to our database? (the newest webhook)
 * A healthy poll with a quiet webhook means the inbox is up to date with the database, but new messages may not arrive.
 */
export function SyncStatus({
  syncing,
  syncedAt,
  error,
  webhookAt,
  pollMs,
  onRefresh,
  refreshing,
}: {
  syncing: boolean;
  syncedAt: number | null;
  error: string | null;
  /** undefined = this transport has no webhook to report (QR gateway). */
  webhookAt?: string | null;
  pollMs: number;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const pull = error ? (
    <Badge tone="danger" icon={<WifiOff aria-hidden />}>Sync failed</Badge>
  ) : syncing ? (
    <Badge tone="info" icon={<Loader2 className="animate-spin" aria-hidden />}>Syncing</Badge>
  ) : syncedAt ? (
    <Badge tone="success" dot>Live</Badge>
  ) : (
    <Badge icon={<Loader2 className="animate-spin" aria-hidden />}>Connecting</Badge>
  );

  const pullText = error
    ? `${error} Retrying every ${pollMs / 1000}s.`
    : syncedAt
      ? `Chats updated ${ago(syncedAt, now)} · checks every ${pollMs / 1000}s`
      : "Loading the latest chats…";

  const health = webhookAt === undefined ? null : webhookHealth(webhookAt, now);

  return (
    <div className="flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-sm">
      <div className="flex min-w-0 flex-1 flex-wrap items-center gap-x-4 gap-y-1.5">
      <div className="flex min-w-0 items-center gap-2" role="status" aria-live="polite">
        {pull}
        <span className="truncate text-ink-muted">{pullText}</span>
      </div>
      {health && (
        <div className="flex min-w-0 items-center gap-2">
          {health === "live" ? (
            <Badge tone="success" icon={<Check aria-hidden />}>WhatsApp</Badge>
          ) : (
            <Badge tone="warning" icon={<AlertTriangle aria-hidden />}>WhatsApp</Badge>
          )}
          <span className="min-w-0 text-ink-muted">
            {health === "none"
              ? "No message from Dualhook received yet. New WhatsApp messages are not arriving."
              : health === "quiet"
                ? `Last event from Dualhook ${ago(webhookAt!, now)}. New WhatsApp messages may not be arriving.`
                : `Last event from Dualhook ${ago(webhookAt!, now)}.`}
          </span>
        </div>
      )}
      </div>
      <Button variant="ghost" size="sm" className="shrink-0" onClick={onRefresh} disabled={refreshing} aria-label="Refresh chats">
        <RefreshCw className={refreshing ? "animate-spin" : ""} aria-hidden />
        <span className="hidden sm:inline">{refreshing ? "Refreshing" : "Refresh"}</span>
      </Button>
    </div>
  );
}
