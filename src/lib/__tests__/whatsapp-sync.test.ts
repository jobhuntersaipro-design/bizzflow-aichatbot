import { describe, expect, it } from "vitest";
import { ago, webhookHealth, WEBHOOK_QUIET_MS } from "@/lib/whatsapp-sync";

const now = Date.parse("2026-11-11T02:00:00Z");

describe("webhookHealth", () => {
  it("is none with no event", () => expect(webhookHealth(null, now)).toBe("none"));
  it("is live inside the quiet window", () => expect(webhookHealth(new Date(now - 60_000).toISOString(), now)).toBe("live"));
  it("is quiet past the window", () => expect(webhookHealth(new Date(now - WEBHOOK_QUIET_MS - 1).toISOString(), now)).toBe("quiet"));
});

describe("ago", () => {
  it("formats each range", () => {
    expect(ago(now - 2_000, now)).toBe("just now");
    expect(ago(now - 45_000, now)).toBe("45s ago");
    expect(ago(now - 12 * 60_000, now)).toBe("12 min ago");
    expect(ago(now - 3 * 3_600_000, now)).toBe("3 h ago");
    expect(ago("2026-11-01T02:00:00Z", now)).toBe("10 days ago");
  });
});
