import { redirect } from "next/navigation";
import { WhatsappDesk } from "@/components/inbox/whatsapp-desk";
import { currentAgent } from "@/lib/agent-gate";
import { listChats, listLabels } from "@/lib/whatsapp-events";
import { whatsappFixtureEnabled } from "@/lib/whatsapp-inbox-fixture";
import { backfillFromEvents } from "@/lib/whatsapp-store";
import { dualhookConfig } from "@/lib/dualhook";

export const dynamic = "force-dynamic";

export default async function WhatsappAdminPage() {
  const signedIn = (await currentAgent()) !== null;
  if (!signedIn) redirect("/login");

  if (!whatsappFixtureEnabled()) await backfillFromEvents();
  const [chats, labels] = await Promise.all([listChats(), listLabels()]);
  return <WhatsappDesk initialChats={chats} initialLabels={labels} transport={dualhookConfig() ? "dualhook" : "gateway"} />;
}
