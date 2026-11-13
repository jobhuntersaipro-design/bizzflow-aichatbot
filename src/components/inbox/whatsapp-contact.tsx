"use client";

import { useState } from "react";
import { Bot, Check, Copy, Info } from "lucide-react";
import type { WhatsappContact } from "@/actions/whatsapp";
import { PersonAvatar } from "@/components/inbox/person-avatar";
import { LabelChip } from "@/components/inbox/whatsapp-crm";
import { WindowChip } from "@/components/inbox/window-chip";
import type { ChatSummary, Label } from "@/lib/whatsapp-inbox";
import { formatKualaLumpur } from "@/lib/whatsapp-webhook";
import { replyTimeLeft } from "@/lib/reply-window";

const BIZZFLOW_URL = process.env.NEXT_PUBLIC_BIZZFLOW_URL ?? "https://bizzflow.top";

const PAUSE_REASON: Record<string, string> = {
  human: "An agent replied, so the AI stopped.",
  documents: "The customer sent a document. An agent must check it.",
  admin: "An agent turned the AI off for this chat.",
};

interface PanelProps {
  waId: string | null;
  name?: string | null;
  contact: WhatsappContact | string | undefined;
  chat?: ChatSummary;
  labelById: Map<string, Label>;
  /** True on Dualhook, where the 24h reply window applies. */
  windowRule: boolean;
  /** Stage / folder / tag controls for the open chat. */
  crm?: React.ReactNode;
}

/** Details of the person in the open chat: facts, AI state, BizzFlow orders and cases. */
export function WhatsappContactPanel({ waId, name, contact, chat, labelById, windowRule, crm }: PanelProps) {
  if (!waId) return null;
  const stage = chat?.stageId ? labelById.get(chat.stageId) : undefined;
  const folder = chat?.folderId ? labelById.get(chat.folderId) : undefined;
  const tags = (chat?.tagIds ?? []).map((id) => labelById.get(id)).filter((l): l is Label => !!l);
  return (
    <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-line p-5 text-sm lg:flex">
      <h2 className="sr-only">Contact details</h2>
      <div className="grid justify-items-start gap-3">
        <PersonAvatar waId={waId} name={name ?? null} size="xl" />
        <div className="grid gap-0.5">
          <p className="text-lg font-medium text-ink">{name ?? "Unknown contact"}</p>
          <CopyNumber waId={waId} />
        </div>
      </div>

      {chat && <Callout chat={chat} windowRule={windowRule} />}

      {chat && (
        <dl className="mt-4 grid grid-cols-[6.5rem_minmax(0,1fr)] gap-x-3 gap-y-2.5">
          <Fact term="Stage">{stage ? <LabelChip label={stage} /> : <Empty />}</Fact>
          <Fact term="Folder">{folder ? <LabelChip label={folder} /> : <Empty />}</Fact>
          <Fact term="Tags">
            {tags.length ? <span className="flex flex-wrap gap-1">{tags.map((t) => <LabelChip key={t.id} label={t} />)}</span> : <Empty />}
          </Fact>
          <Fact term="Sign-up chance">
            {chat.signupChance === null ? <Empty /> : <Chance value={chat.signupChance} />}
          </Fact>
          <Fact term="Last message">{chat.lastInboundAt ? formatKualaLumpur(chat.lastInboundAt) : <Empty />}</Fact>
          {windowRule && (
            <Fact term="AI replies">
              <span className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${chat.aiEnabled === false ? "bg-gray-100 text-gray-700" : "bg-emerald-100 text-emerald-700"}`}>
                <Bot className="size-3" aria-hidden />
                {chat.aiEnabled === false ? "Paused" : "On"}
              </span>
            </Fact>
          )}
        </dl>
      )}

      {crm && <Section title="AI analysis and labels">{crm}</Section>}

      {contact === undefined ? (
        <p className="mt-4 text-sm text-ink-muted">Looking up BizzFlow records…</p>
      ) : typeof contact === "string" ? (
        <p className="mt-4 text-sm text-danger">{contact}</p>
      ) : (
        <>
          <Section title={`Orders · ${contact.orders.length}`}>
            <Cards empty="No orders with this number.">
              {contact.orders.map((o) => (
                <li key={o.id}>
                  <a href={`${BIZZFLOW_URL}/admin/orders/${o.id}`} target="_blank" rel="noreferrer" className="block rounded-xl border border-line p-3 hover:bg-ink/5">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-medium text-ink">{o.reference ?? "Order"}</span>
                      <StatusChip status={o.deleted ? "Deleted" : o.status} />
                    </span>
                    {o.offer && <span className="block truncate text-xs text-ink-muted">{o.offer}</span>}
                    <span className="block text-[11px] text-ink-muted">{formatKualaLumpur(o.createdAt)}</span>
                  </a>
                </li>
              ))}
            </Cards>
          </Section>
          <Section title={`Cases · ${contact.cases.length}`}>
            <Cards empty="No crawled cases with this number.">
              {contact.cases.map((c) => (
                <li key={c.caseNo} className="rounded-xl border border-line p-3">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-mono text-sm text-ink">{c.caseNo}</span>
                    {c.status && <StatusChip status={c.status} />}
                  </span>
                  {c.provider && <span className="block truncate text-xs text-ink-muted">{c.provider}</span>}
                </li>
              ))}
            </Cards>
          </Section>
        </>
      )}
    </aside>
  );
}

function CopyNumber({ waId }: { waId: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <span className="flex items-center gap-1.5">
      <span className="font-mono text-xs text-ink-muted">+{waId}</span>
      <button
        type="button"
        aria-label="Copy number"
        onClick={() => {
          void navigator.clipboard?.writeText(`+${waId}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
          });
        }}
        className="grid size-6 place-items-center rounded-md text-ink-muted hover:bg-ink/5 hover:text-ink"
      >
        {copied ? <Check className="size-3.5 text-emerald-600" aria-hidden /> : <Copy className="size-3.5" aria-hidden />}
      </button>
    </span>
  );
}

/** The one thing the agent must know now: the reply window or why the AI stopped. */
function Callout({ chat, windowRule }: { chat: ChatSummary; windowRule: boolean }) {
  const paused = windowRule && chat.aiEnabled === false;
  const left = replyTimeLeft(chat.lastInboundAt);
  if (!windowRule) return null;
  const tone = !left ? "border-red-200 bg-red-50 text-red-800" : paused ? "border-amber-200 bg-amber-50 text-amber-900" : "border-sky-200 bg-sky-50 text-sky-900";
  const text = !left
    ? "The 24h reply window is closed. Reply from the phone app."
    : paused
      ? (PAUSE_REASON[chat.aiPausedReason ?? ""] ?? "The AI is paused for this chat.")
      : `You can reply for ${left} more. The AI answers from the knowledge document.`;
  return (
    <div className={`mt-4 flex gap-2 rounded-xl border p-3 text-xs ${tone}`}>
      <Info className="mt-px size-3.5 shrink-0" aria-hidden />
      <div className="grid gap-1.5">
        <p>{text}</p>
        {left && <WindowChip lastInboundAt={chat.lastInboundAt} />}
      </div>
    </div>
  );
}

function Fact({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-xs text-ink-muted">{term}</dt>
      <dd className="min-w-0 text-xs text-ink">{children}</dd>
    </>
  );
}

function Empty() {
  return <span className="text-ink-muted">—</span>;
}

function Chance({ value }: { value: number }) {
  const color = value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-amber-500" : "bg-rose-500";
  return (
    <span className="flex items-center gap-2">
      <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink/10">
        <span className={`block h-full rounded-full ${color}`} style={{ width: `${value}%` }} />
      </span>
      <span className="tabular-nums">{value}%</span>
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const s = status.toLowerCase();
  const tone = /submit|activ|complete|success/.test(s)
    ? "bg-emerald-100 text-emerald-700"
    : /fail|reject|delet|cancel/.test(s)
      ? "bg-red-100 text-red-700"
      : /draft|pending|warn/.test(s)
        ? "bg-amber-100 text-amber-800"
        : "bg-gray-100 text-gray-700";
  return <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${tone}`}>{status}</span>;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-4 border-t border-line pt-4">
      <h3 className="mb-2 text-sm font-medium text-ink">{title}</h3>
      {children}
    </div>
  );
}

function Cards({ empty, children }: { empty: string; children: React.ReactNode[] }) {
  return children.length === 0 ? <p className="text-sm text-ink-muted">{empty}</p> : <ul className="space-y-2">{children}</ul>;
}
