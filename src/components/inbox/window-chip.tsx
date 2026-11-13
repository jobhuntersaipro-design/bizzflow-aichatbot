import { Clock } from "lucide-react";
import { replyTimeLeft } from "@/lib/reply-window";

/** Amber "Reply in 6h" while the 24h window is open, red "Window closed" after it. */
export function WindowChip({ lastInboundAt }: { lastInboundAt: string | null }) {
  const left = replyTimeLeft(lastInboundAt);
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[11px] font-medium ${
        left ? "bg-amber-100 text-amber-800" : "bg-red-100 text-red-700"
      }`}
    >
      <Clock className="size-3" aria-hidden />
      {left ? `Reply in ${left}` : "Window closed"}
    </span>
  );
}
