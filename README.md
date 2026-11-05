# BizzFlow AI Chatbot

WhatsApp inbox, CRM and AI assistant for BizzFlow, served at aichatbot.bizzflow.top.

## Set up

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `AUTH_SECRET`.
2. Run `npm install` and `npx prisma migrate deploy`.
3. Create the first owner: `AGENT_PASSWORD='…' npm run agent:create -- you@example.com "Your Name" owner`.
4. Run `npm run dev` and sign in at http://localhost:3000.

See `context/project-overview.md` for how the app fits with BizzFlow.
