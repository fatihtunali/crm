-- Issue #33: Add soft delete support to Lead and Tour models
-- Migration: Add deletedAt timestamp fields

-- Add deletedAt field to leads table
ALTER TABLE "leads" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Create index on deletedAt for leads
CREATE INDEX "leads_deleted_at_idx" ON "leads"("deleted_at");

-- Add deletedAt field to tours table
ALTER TABLE "tours" ADD COLUMN "deleted_at" TIMESTAMP(3);

-- Create index on deletedAt for tours
CREATE INDEX "tours_deleted_at_idx" ON "tours"("deleted_at");

-- Add comments for documentation
COMMENT ON COLUMN "leads"."deleted_at" IS 'Issue #33: Soft delete timestamp - when the lead was soft deleted';
COMMENT ON COLUMN "tours"."deleted_at" IS 'Issue #33: Soft delete timestamp - when the tour was soft deleted';
