import { redirect } from "next/navigation";
import { AppShell } from "@/components/shell/app-shell";
import { currentAgent } from "@/lib/agent-gate";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const agent = await currentAgent();
  if (!agent) redirect("/login");
  return <AppShell agent={agent}>{children}</AppShell>;
}
