# Project overview

## What it is

A WhatsApp inbox and AI chatbot for BizzFlow, the Unifi/TM fibre sales tool at bizzflow.top.
It started as the `/admin/whatsapp` inbox inside BizzFlow and moved here on 2026-11-05.

## How it fits with BizzFlow

- This app owns the WhatsApp number, the chats, the CRM labels and the AI replies. It has its own Neon database.
- BizzFlow owns Order Entry, plans and WifiBizz cases. This app reaches them only through the BizzFlow
  chatbot API (`src/lib/bizzflow.ts`), protected by `CHATBOT_API_SECRET`:
  - `GET /api/chatbot/contact?phone=…` — orders and cases for a number
  - `GET /api/chatbot/accounts` — Order Entry accounts
  - `POST /api/chatbot/order-draft` — a draft from a chat
  - `POST /api/chatbot/order-draft/<id>/document` — one document, raw body, `x-filename` header

## Stack

Next.js 16 (App Router), Prisma 7 + Neon, NextAuth v5 (credentials, JWT), Tailwind v4, Arc design components,
Anthropic SDK, Vercel.

## Main parts

| Part | Where |
| --- | --- |
| Dualhook webhook (Meta Cloud API) | `src/app/api/whatsapp/dualhook/[key]/route.ts`, `src/lib/dualhook*.ts` |
| Old QR gateway webhook | `src/app/api/whatsapp/webhook/route.ts` |
| Message store and inbox reads | `src/lib/whatsapp-store.ts`, `whatsapp-events.ts`, `whatsapp-inbox.ts` |
| AI reply (knowledge document) | `src/lib/whatsapp-ai.ts` |
| AI sorting (stage, folder, tags, intent) | `src/lib/whatsapp-crm.ts` |
| Inbox UI | `src/app/(app)/inbox`, `src/components/inbox/*` |
| Agents and roles | `src/app/(app)/agents`, `src/actions/agents.ts`, `src/lib/roles.ts` |

## Roles

- owner: manages agents, everything else.
- manager: edits labels, the AI model, the knowledge document and the WhatsApp connection.
- agent: works chats.

## Roadmap

See the gap analysis doc. Next: assignment, internal notes, quick replies; then contacts; then templates and
broadcasts; then an AI agent with tools; then workflows and reports.
