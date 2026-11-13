import type { WhatsappContact } from "@/actions/whatsapp";

const BIZZFLOW_URL = process.env.NEXT_PUBLIC_BIZZFLOW_URL ?? "https://bizzflow.top";
import { formatKualaLumpur } from "@/lib/whatsapp-webhook";

/** BizzFlow orders and cases that carry this WhatsApp number. Read-only. */
export function WhatsappContactPanel({
  waId,
  name,
  contact,
  crm,
}: {
  waId: string | null;
  name?: string | null;
  contact: WhatsappContact | string | undefined;
  /** Stage / folder / tag controls for the open chat. */
  crm?: React.ReactNode;
}) {
  return (
    <aside className="hidden w-80 shrink-0 flex-col overflow-y-auto border-l border-line p-5 text-sm xl:flex">
      <h2 className="sr-only">Contact</h2>
      {!waId ? (
        <p className="mt-2 text-sm text-ink-muted">Select a chat</p>
      ) : (
        <>
          <div className="grid gap-0.5">
            <p className="text-base font-medium text-ink">{name ?? "Unknown contact"}</p>
            <p className="font-mono text-xs text-ink-muted">+{waId}</p>
          </div>
          {crm && <div className="mt-4 border-t border-line pt-4">{crm}</div>}
          {contact === undefined ? (
            <p className="mt-4 text-sm text-ink-muted">Looking up BizzFlow records…</p>
          ) : typeof contact === "string" ? (
            <p className="mt-4 text-sm text-danger">{contact}</p>
          ) : (
            <>
              <Section title="Orders" empty="No orders with this number.">
                {contact.orders.map((o) => (
                  <li key={o.id}>
                    <a href={`${BIZZFLOW_URL}/admin/orders/${o.id}`} target="_blank" rel="noreferrer" className="block rounded-xl border border-line p-3 hover:bg-ink/5">
                      <span className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-ink">{o.reference ?? "Order"}</span>
                        <span className="text-[11px] text-ink-muted">{o.deleted ? "Deleted" : o.status}</span>
                      </span>
                      <span className="block truncate text-xs text-ink-muted">{o.name}</span>
                      {o.offer && <span className="block truncate text-xs text-ink-muted">{o.offer}</span>}
                      <span className="block text-[11px] text-ink-muted">{formatKualaLumpur(o.createdAt)}</span>
                    </a>
                  </li>
                ))}
              </Section>
              <Section title="Cases" empty="No crawled cases with this number.">
                {contact.cases.map((c) => (
                  <li key={c.caseNo} className="rounded-xl border border-line p-3">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-mono text-sm text-ink">{c.caseNo}</span>
                      <span className="text-[11px] text-ink-muted">{c.status ?? "—"}</span>
                    </span>
                    {c.name && <span className="block truncate text-xs text-ink-muted">{c.name}</span>}
                    {c.provider && <span className="block truncate text-xs text-ink-muted">{c.provider}</span>}
                  </li>
                ))}
              </Section>
            </>
          )}
        </>
      )}
    </aside>
  );
}

function Section({ title, empty, children }: { title: string; empty: string; children: React.ReactNode[] }) {
  return (
    <div className="mt-4 border-t border-line pt-4">
      <h3 className="text-sm font-medium text-ink">{title}</h3>
      {children.length === 0 ? <p className="mt-1 text-sm text-ink-muted">{empty}</p> : <ul className="mt-2 space-y-2">{children}</ul>}
    </div>
  );
}
