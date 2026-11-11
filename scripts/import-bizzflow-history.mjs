/**
 * Copies the WhatsApp history from the BizzFlow database into this app's database:
 *   BIZZFLOW_DATABASE_URL=… DATABASE_URL=… npm run history:import
 * The two schemas are the same. Rows that exist here already stay as they are,
 * so you can run it again safely.
 */
import { neon } from "@neondatabase/serverless";

// Raw JSON from Postgres, so timestamps keep their exact value.
// Labels first: chats point at label ids.
const TABLES = [
  ["whatsapp_labels", "id"],
  ["whatsapp_crm_settings", "id"],
  ["whatsapp_conversations", "wa_id"],
  ["whatsapp_messages", "message_id"],
  ["whatsapp_alerts", "id"],
  ["whatsapp_webhook_events", "id"],
];
const CHUNK = 200;

const from = neon(need("BIZZFLOW_DATABASE_URL"));
const to = neon(need("DATABASE_URL"));

for (const [table, key] of TABLES) {
  let last = "";
  let copied = 0;
  let read = 0;
  for (;;) {
    const rows = await from.query(
      `SELECT ${key}::text AS k, row_to_json(t)::text AS j FROM ${table} t
       WHERE ${key}::text > $1 ORDER BY ${key}::text LIMIT ${CHUNK}`,
      [last],
    );
    if (rows.length === 0) break;
    const res = await to.query(
      `INSERT INTO ${table} SELECT * FROM json_populate_recordset(null::${table}, $1::json)
       ON CONFLICT DO NOTHING RETURNING 1`,
      [`[${rows.map((r) => r.j).join(",")}]`],
    );
    read += rows.length;
    copied += res.length;
    last = rows[rows.length - 1].k;
  }
  console.log(`${table}: ${copied} copied, ${read - copied} already here`);
}

function need(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Set ${name}.`);
  return v;
}
