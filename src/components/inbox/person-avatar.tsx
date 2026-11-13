"use client";

import { useState } from "react";
import { avatarGradient } from "@/lib/reply-window";

const SIZES = { sm: "size-7 text-[11px]", xl: "size-20 text-2xl" } as const;

/** Gradient avatar with initials. Shows the WhatsApp photo on top when one loads. */
export function PersonAvatar({ waId, name, size = "sm" }: { waId: string; name: string | null; size?: keyof typeof SIZES }) {
  const [failed, setFailed] = useState(false);
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("")
    : waId.slice(-2);
  return (
    <span
      role="img"
      aria-label={name ?? `+${waId}`}
      className={`relative inline-grid shrink-0 place-items-center overflow-hidden rounded-full bg-linear-to-br font-medium text-white ${avatarGradient(waId)} ${SIZES[size]}`}
    >
      <span aria-hidden>{initials}</span>
      {!failed && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/inbox/avatar?wa=${waId}`}
          alt=""
          onError={() => setFailed(true)}
          className="absolute inset-0 size-full object-cover"
        />
      )}
    </span>
  );
}
