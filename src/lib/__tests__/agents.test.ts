import { describe, expect, it } from "vitest";
import { checkAgentInput, MIN_PASSWORD } from "@/lib/agent-rules";
import { hasRole, isRole } from "@/lib/roles";

describe("roles", () => {
  it("ranks owner over manager over agent", () => {
    expect(hasRole("owner", "manager")).toBe(true);
    expect(hasRole("manager", "manager")).toBe(true);
    expect(hasRole("agent", "manager")).toBe(false);
    expect(hasRole("manager", "owner")).toBe(false);
  });

  it("knows only the three roles", () => {
    expect(isRole("agent")).toBe(true);
    expect(isRole("admin")).toBe(false);
    expect(isRole(undefined)).toBe(false);
  });
});

describe("checkAgentInput", () => {
  const ok = { name: "  Sofie   Tan ", email: " Sofie@Example.com ", role: "agent", password: "x".repeat(MIN_PASSWORD) };

  it("cleans the name and email", () => {
    expect(checkAgentInput(ok)).toEqual({ ok: true, value: { name: "Sofie Tan", email: "sofie@example.com", role: "agent", password: ok.password } });
  });

  it("refuses a short password, a bad email and an unknown role", () => {
    expect(checkAgentInput({ ...ok, password: "short" }).ok).toBe(false);
    expect(checkAgentInput({ ...ok, email: "sofie" }).ok).toBe(false);
    expect(checkAgentInput({ ...ok, role: "admin" }).ok).toBe(false);
    expect(checkAgentInput({ ...ok, name: " " }).ok).toBe(false);
  });
});
