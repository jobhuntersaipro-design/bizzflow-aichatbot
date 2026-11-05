"use client";

import { useState } from "react";
import { createAgent, updateAgent } from "@/actions/agents";
import { Button } from "@/components/ui/button";
import { MIN_PASSWORD } from "@/lib/agent-rules";
import { ROLES } from "@/lib/roles";
import { toast } from "@/lib/toast";

interface AgentRow {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  lastLoginAt: string | null;
}

const FIELD = "rounded-md border border-line bg-card px-3 py-2 text-sm text-ink";

export function AgentsTable({ agents, meId }: { agents: AgentRow[]; meId: string }) {
  const [busy, setBusy] = useState(false);

  async function add(form: FormData) {
    setBusy(true);
    const res = await createAgent({
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      role: String(form.get("role") ?? "agent"),
      password: String(form.get("password") ?? ""),
    });
    setBusy(false);
    if (res.success) toast.success("Agent added. Send them the email and password.");
    else toast.error(res.error);
  }

  async function change(id: string, patch: { role?: string; active?: boolean }) {
    const res = await updateAgent(id, patch);
    if (!res.success) toast.error(res.error);
  }

  return (
    <div className="space-y-6">
      <form action={add} className="grid gap-3 rounded-xl border border-line bg-card p-4 sm:grid-cols-2">
        <input name="name" placeholder="Name" required className={FIELD} />
        <input name="email" type="email" placeholder="Email" required className={FIELD} />
        <select name="role" defaultValue="agent" className={FIELD}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <input name="password" type="password" placeholder={`Password (min ${MIN_PASSWORD})`} required minLength={MIN_PASSWORD} className={FIELD} />
        <div className="sm:col-span-2">
          <Button type="submit" disabled={busy}>
            {busy ? "Adding…" : "Add agent"}
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded-xl border border-line bg-card">
        <table className="w-full text-sm">
          <thead className="text-left text-ink-muted">
            <tr>
              <th className="p-3 font-medium">Name</th>
              <th className="p-3 font-medium">Email</th>
              <th className="p-3 font-medium">Role</th>
              <th className="p-3 font-medium">Last sign-in</th>
              <th className="p-3 font-medium">Active</th>
            </tr>
          </thead>
          <tbody>
            {agents.map((a) => (
              <tr key={a.id} className="border-t border-line">
                <td className="p-3 text-ink">{a.name}</td>
                <td className="p-3 text-ink-soft">{a.email}</td>
                <td className="p-3">
                  <select
                    defaultValue={a.role}
                    disabled={a.id === meId}
                    onChange={(e) => change(a.id, { role: e.target.value })}
                    className={FIELD}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-3 text-ink-muted">{a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleString("en-GB") : "Never"}</td>
                <td className="p-3">
                  <input
                    type="checkbox"
                    aria-label={`${a.name} active`}
                    defaultChecked={a.active}
                    disabled={a.id === meId}
                    onChange={(e) => change(a.id, { active: e.target.checked })}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
