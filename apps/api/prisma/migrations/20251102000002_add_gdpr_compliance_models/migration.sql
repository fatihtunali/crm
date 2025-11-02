-- CreateEnum for Consent Purposes (Issue #23)
CREATE TYPE "ConsentPurpose" AS ENUM ('DATA_PROCESSING', 'MARKETING_EMAIL', 'MARKETING_SMS', 'MARKETING_PHONE', 'ANALYTICS', 'THIRD_PARTY_SHARING', 'PROFILING');

-- CreateTable: Consent Management (Issue #23 - GDPR consent tracking)
CREATE TABLE "consents" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "client_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "purpose" "ConsentPurpose" NOT NULL,
    "granted" BOOLEAN NOT NULL DEFAULT false,
    "version" VARCHAR(50) NOT NULL,
    "granted_at" TIMESTAMP(3) NOT NULL,
    "revoked_at" TIMESTAMP(3),
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "consents_pkey" PRIMARY KEY ("id")
);

-- CreateTable: Privacy Policy Acceptance Tracking (Issue #26 - GDPR compliance)
CREATE TABLE "privacy_policy_acceptances" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "client_id" INTEGER,
    "version" VARCHAR(50) NOT NULL,
    "accepted_at" TIMESTAMP(3) NOT NULL,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "privacy_policy_acceptances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for Consents
CREATE INDEX "consents_tenant_id_client_id_idx" ON "consents"("tenant_id", "client_id");
CREATE INDEX "consents_purpose_idx" ON "consents"("purpose");
CREATE INDEX "consents_granted_idx" ON "consents"("granted");
CREATE INDEX "consents_created_at_idx" ON "consents"("created_at");

-- CreateIndex for Privacy Policy Acceptances
CREATE INDEX "privacy_policy_acceptances_user_id_idx" ON "privacy_policy_acceptances"("user_id");
CREATE INDEX "privacy_policy_acceptances_client_id_idx" ON "privacy_policy_acceptances"("client_id");
CREATE INDEX "privacy_policy_acceptances_version_idx" ON "privacy_policy_acceptances"("version");
CREATE INDEX "privacy_policy_acceptances_tenant_id_idx" ON "privacy_policy_acceptances"("tenant_id");

-- AddForeignKey for Consents
ALTER TABLE "consents" ADD CONSTRAINT "consents_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consents" ADD CONSTRAINT "consents_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "consents" ADD CONSTRAINT "consents_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for Privacy Policy Acceptances
ALTER TABLE "privacy_policy_acceptances" ADD CONSTRAINT "privacy_policy_acceptances_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "privacy_policy_acceptances" ADD CONSTRAINT "privacy_policy_acceptances_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "privacy_policy_acceptances" ADD CONSTRAINT "privacy_policy_acceptances_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
