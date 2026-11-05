Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "agents" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'agent',
    "active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_log" (
    "id" TEXT NOT NULL,
    "agent_id" TEXT,
    "action" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_webhook_events" (
    "id" TEXT NOT NULL,
    "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "field" TEXT,
    "from_wa_id" TEXT,
    "to_wa_id" TEXT,
    "message_id" TEXT,
    "message_type" TEXT,
    "text_preview" TEXT,
    "raw_body" TEXT NOT NULL,

    CONSTRAINT "whatsapp_webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_conversations" (
    "wa_id" TEXT NOT NULL,
    "closed_at" TIMESTAMP(3),
    "last_read_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,
    "name" TEXT,
    "last_message_at" TIMESTAMP(3),
    "last_inbound_at" TIMESTAMP(3),
    "last_preview" TEXT,
    "stage_id" TEXT,
    "folder_id" TEXT,
    "tag_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "stage_by" TEXT,
    "folder_by" TEXT,
    "tags_by" TEXT,
    "ai_reason" TEXT,
    "intent" TEXT,
    "signup_chance" INTEGER,
    "insight_by" TEXT,
    "classified_at" TIMESTAMP(3),
    "ai_enabled" BOOLEAN NOT NULL DEFAULT true,
    "ai_paused_reason" TEXT,
    "ai_paused_at" TIMESTAMP(3),

    CONSTRAINT "whatsapp_conversations_pkey" PRIMARY KEY ("wa_id")
);

-- CreateTable
CREATE TABLE "whatsapp_crm_settings" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "model" TEXT,
    "knowledge_name" TEXT,
    "knowledge_mime" TEXT,
    "knowledge_doc" TEXT,
    "knowledge_updated_at" TIMESTAMP(3),
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_crm_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_messages" (
    "message_id" TEXT NOT NULL,
    "wa_id" TEXT NOT NULL,
    "from_me" BOOLEAN NOT NULL,
    "type" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "media" JSONB,
    "status" TEXT,
    "error" TEXT,
    "source" TEXT NOT NULL,
    "by_ai" BOOLEAN NOT NULL DEFAULT false,
    "sent_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_messages_pkey" PRIMARY KEY ("message_id")
);

-- CreateTable
CREATE TABLE "whatsapp_alerts" (
    "id" TEXT NOT NULL,
    "wa_id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen_at" TIMESTAMP(3),

    CONSTRAINT "whatsapp_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_labels" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "color" TEXT NOT NULL DEFAULT 'gray',
    "sort" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_labels_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "agents_email_key" ON "agents"("email");

-- CreateIndex
CREATE INDEX "audit_log_created_at_idx" ON "audit_log"("created_at");

-- CreateIndex
CREATE INDEX "whatsapp_webhook_events_received_at_idx" ON "whatsapp_webhook_events"("received_at");

-- CreateIndex
CREATE INDEX "whatsapp_conversations_last_message_at_idx" ON "whatsapp_conversations"("last_message_at");

-- CreateIndex
CREATE INDEX "whatsapp_messages_wa_id_sent_at_idx" ON "whatsapp_messages"("wa_id", "sent_at");

-- CreateIndex
CREATE INDEX "whatsapp_alerts_created_at_idx" ON "whatsapp_alerts"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_labels_kind_name_key" ON "whatsapp_labels"("kind", "name");

