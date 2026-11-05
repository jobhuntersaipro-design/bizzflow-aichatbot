/**
 * Creates the first owner (or any agent) from the command line:
 *   npm run agent:create -- owner@example.com "Kim" owner
 * The password is read from AGENT_PASSWORD, so it never lands in shell history.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../src/lib/prisma";
import { checkAgentInput } from "../src/lib/agent-rules";

async function main() {
  const [email, name, role = "owner"] = process.argv.slice(2);
  const checked = checkAgentInput({ email, name, role, password: process.env.AGENT_PASSWORD });
  if (!checked.ok) throw new Error(checked.error);
  const { password, ...rest } = checked.value;
  const agent = await prisma.agent.upsert({
    where: { email: rest.email },
    create: { ...rest, passwordHash: await bcrypt.hash(password, 12) },
    update: { name: rest.name, role: rest.role, active: true, passwordHash: await bcrypt.hash(password, 12) },
  });
  console.log(`Agent ${agent.email} (${agent.role}) is ready.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
