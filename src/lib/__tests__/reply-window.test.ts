import { describe, expect, it } from "vitest";
import { avatarGradient, replyTimeLeft } from "@/lib/reply-window";

const now = new Date("2026-11-13T12:00:00Z");

describe("replyTimeLeft", () => {
  it("counts hours while the window is open", () => {
    expect(replyTimeLeft("2026-11-13T06:00:00Z", now)).toBe("18h");
  });
  it("counts minutes in the last hour", () => {
    expect(replyTimeLeft("2026-11-12T12:14:00Z", now)).toBe("14m");
  });
  it("returns null after 24 hours or with no message", () => {
    expect(replyTimeLeft("2026-11-12T11:59:00Z", now)).toBeNull();
    expect(replyTimeLeft(null, now)).toBeNull();
  });
});

describe("avatarGradient", () => {
  it("gives one number the same gradient every time", () => {
    expect(avatarGradient("60123456789")).toBe(avatarGradient("60123456789"));
  });
});
