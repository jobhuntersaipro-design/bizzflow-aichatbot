"use server";

import { AuthError } from "next-auth";
import { signIn } from "@/auth";

export async function login(_prev: string | null, form: FormData): Promise<string | null> {
  try {
    await signIn("credentials", {
      email: String(form.get("email") ?? ""),
      password: String(form.get("password") ?? ""),
      redirectTo: "/inbox",
    });
    return null;
  } catch (e) {
    if (e instanceof AuthError) return "Wrong email or password, or the account is turned off.";
    throw e;
  }
}
