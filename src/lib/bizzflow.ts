/**
 * Client for the BizzFlow chatbot API (bizzflow.top/api/chatbot/*).
 *
 * BizzFlow keeps Order Entry and the WifiBizz cases. The chatbot reads them and
 * creates order drafts through this API only. It never touches BizzFlow's
 * database. Both sides share CHATBOT_API_SECRET.
 */

export type BizzflowConfig = { baseUrl: string; secret: string };

export type BizzflowOrder = {
  id: string;
  reference: string | null;
  name: string;
  status: string;
  offer: string | null;
  createdAt: string;
  deleted: boolean;
};

export type BizzflowCase = {
  caseNo: string;
  name: string | null;
  status: string | null;
  provider: string | null;
  createdAt: string | null;
};

export type OrderEntryAccount = { id: string; email: string; name: string | null };

type Outcome<T> = { ok: true; data: T } | { ok: false; error: string };

const TIMEOUT_MS = 15_000;

export function bizzflowConfig(): BizzflowConfig | null {
  const baseUrl = (process.env.BIZZFLOW_API_URL ?? "").trim().replace(/\/+$/, "");
  const secret = (process.env.CHATBOT_API_SECRET ?? "").trim();
  if (!baseUrl || !secret) return null;
  return { baseUrl, secret };
}

async function call<T>(path: string, init: RequestInit = {}): Promise<Outcome<T>> {
  const config = bizzflowConfig();
  if (!config) return { ok: false, error: "BizzFlow is not connected (set BIZZFLOW_API_URL and CHATBOT_API_SECRET)." };
  try {
    const res = await fetch(`${config.baseUrl}/api/chatbot${path}`, {
      ...init,
      headers: { ...init.headers, authorization: `Bearer ${config.secret}` },
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    });
    const body = (await res.json().catch(() => null)) as { error?: string } | null;
    if (!res.ok) return { ok: false, error: body?.error ?? `BizzFlow answered ${res.status}.` };
    return { ok: true, data: body as T };
  } catch (e) {
    console.error("[bizzflow]", path, e);
    return { ok: false, error: "Could not reach BizzFlow." };
  }
}

/** BizzFlow orders and WifiBizz cases whose mobile matches one of these spellings. */
export function lookupContact(phones: string[]) {
  const q = new URLSearchParams(phones.map((p) => ["phone", p]));
  return call<{ orders: BizzflowOrder[]; cases: BizzflowCase[] }>(`/contact?${q}`);
}

/** Order Entry accounts a chat can be pushed to. */
export function listOrderEntryAccounts() {
  return call<{ accounts: OrderEntryAccount[] }>("/accounts");
}

/** A new draft in that account. Documents follow one per call, so no request passes Vercel's body limit. */
export function createOrderDraft(input: { accountId: string; waId: string; name: string }) {
  return call<{ id: string; reference: string | null; email: string }>("/order-draft", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

/** Largest file sent in one call. Vercel functions refuse bodies above 4.5 MB. */
export const MAX_DOCUMENT_BYTES = 4_000_000;

export function attachOrderDocument(orderId: string, file: { filename: string; mime: string; bytes: Uint8Array }) {
  return call<{ key: string }>(`/order-draft/${encodeURIComponent(orderId)}/document`, {
    method: "POST",
    headers: { "content-type": file.mime, "x-filename": file.filename },
    body: Buffer.from(file.bytes),
  });
}
