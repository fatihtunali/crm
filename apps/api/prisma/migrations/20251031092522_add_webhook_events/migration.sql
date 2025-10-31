-- CreateEnum
CREATE TYPE "WebhookEventStatus" AS ENUM ('PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'RETRY');

-- CreateEnum
CREATE TYPE "WebhookEventType" AS ENUM ('PAYMENT_SUCCESS', 'PAYMENT_FAILED', 'PAYMENT_PENDING', 'REFUND_PROCESSED', 'REFUND_FAILED');

-- CreateTable
CREATE TABLE "webhook_events" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "provider" VARCHAR(100) NOT NULL,
    "event_type" "WebhookEventType" NOT NULL,
    "status" "WebhookEventStatus" NOT NULL DEFAULT 'PENDING',
    "payload_json" JSONB NOT NULL,
    "signature_header" VARCHAR(500),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "processed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "webhook_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "webhook_events_tenant_id_idx" ON "webhook_events"("tenant_id");

-- CreateIndex
CREATE INDEX "webhook_events_provider_idx" ON "webhook_events"("provider");

-- CreateIndex
CREATE INDEX "webhook_events_event_type_idx" ON "webhook_events"("event_type");

-- CreateIndex
CREATE INDEX "webhook_events_status_idx" ON "webhook_events"("status");

-- CreateIndex
CREATE INDEX "webhook_events_created_at_idx" ON "webhook_events"("created_at");

-- AddForeignKey
ALTER TABLE "webhook_events" ADD CONSTRAINT "webhook_events_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
