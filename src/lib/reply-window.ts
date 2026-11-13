import { SEND_WINDOW_MS } from "@/lib/dualhook-window";

/** Time left in the 24h reply window, as "14m" or "6h". Null when the window is closed or unknown. */
export function replyTimeLeft(lastInboundAt: string | null | undefined, now = new Date()): string | null {
  if (!lastInboundAt) return null;
  const left = new Date(lastInboundAt).getTime() + SEND_WINDOW_MS - now.getTime();
  if (!Number.isFinite(left) || left <= 0) return null;
  const minutes = Math.ceil(left / 60_000);
  return minutes < 60 ? `${minutes}m` : `${Math.ceil(minutes / 60)}h`;
}

const GRADIENTS = [
  "from-pink-400 to-orange-300",
  "from-violet-500 to-fuchsia-400",
  "from-sky-400 to-emerald-300",
  "from-amber-400 to-rose-400",
  "from-emerald-400 to-teal-300",
  "from-indigo-500 to-sky-400",
  "from-rose-400 to-violet-400",
  "from-lime-400 to-emerald-400",
];

/** One gradient per customer number, so a person keeps the same colour everywhere. */
export function avatarGradient(key: string): string {
  let hash = 0;
  for (const ch of key) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
  return GRADIENTS[hash % GRADIENTS.length];
}
