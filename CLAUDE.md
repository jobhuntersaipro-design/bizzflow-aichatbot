# BizzFlow AI Chatbot

WhatsApp inbox, CRM and AI assistant for BizzFlow agents, at aichatbot.bizzflow.top.
The goal is a respond.io-style platform: agents, assignment, contacts, broadcasts, workflows, AI agent, reports.

## Context Files
- @context/project-overview.md
- @context/coding-standard.md
- @context/ai-interaction.md

## Commands
- `npm run dev` — start dev server
- `npm run build` — production build (runs `prisma migrate deploy` except on Vercel previews)
- `npm run lint` — ESLint
- `npm test` — Vitest
- `AGENT_PASSWORD=… npm run agent:create -- you@example.com "Name" owner` — create an agent

## Reply shape
- First sentence = result.
- No restating the task. No “I’ll now…”. No closing recap.
- Between tools: one short status line only if direction changed.
- After edits: files changed, behavior change, tests run, leftover risk.
- If I ask for detail, then expand.

## Writing style: ASD-STE100 (Simplified Technical English)
Apply to: code comments, commit messages, PR descriptions, docs, UI text.
- One word = one meaning. Use the same term every time (e.g. always "outlet", never "branch"/"hub").
- Procedural sentences: max 20 words. Descriptive sentences: max 25 words.
- One instruction per sentence. Start instructions with a verb (imperative).
- Use active voice. Do not use passive voice.
- Use simple tenses only (present, past, future).
- Put a warning or caution BEFORE the step it applies to.
- Paragraphs: max 6 sentences, one topic each.
- No slang, idioms, or unnecessary abbreviations.

Note: UI text in Chinese/Malay keeps its language; the rules apply to English text.
