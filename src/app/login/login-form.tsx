"use client";

import { useActionState } from "react";
import { login } from "@/actions/auth";
import { Button } from "@/components/ui/button";

export function LoginForm() {
  const [error, action, pending] = useActionState(login, null);
  return (
    <form action={action} className="w-full max-w-sm space-y-4 rounded-xl border border-line bg-card p-6">
      <h1 className="text-lg font-semibold text-ink">Sign in to BizzFlow AI Chatbot</h1>
      <label className="block space-y-1">
        <span className="text-sm text-ink-soft">Email</span>
        <input name="email" type="email" required autoComplete="email" className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink" />
      </label>
      <label className="block space-y-1">
        <span className="text-sm text-ink-soft">Password</span>
        <input name="password" type="password" required autoComplete="current-password" className="w-full rounded-md border border-line bg-card px-3 py-2 text-sm text-ink" />
      </label>
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
