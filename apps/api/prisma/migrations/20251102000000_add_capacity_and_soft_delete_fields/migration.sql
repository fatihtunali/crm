-- Issue #31: Add capacity validation fields
-- Add minParticipants and maxParticipants to activities table
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "min_participants" INTEGER;
ALTER TABLE "activities" ADD COLUMN IF NOT EXISTS "max_participants" INTEGER;

-- Remove old capacity column if it exists and replace with specific fields
-- ALTER TABLE "activities" DROP COLUMN IF EXISTS "capacity";

-- Issue #33: Add soft delete timestamp fields
-- Add deletedAt to User model
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "users_deleted_at_idx" ON "users"("deleted_at");

-- Add deletedAt to Client model
ALTER TABLE "clients" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "clients_deleted_at_idx" ON "clients"("deleted_at");

-- Add deletedAt to Vendor model
ALTER TABLE "vendors" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "vendors_deleted_at_idx" ON "vendors"("deleted_at");

-- Add deletedAt to ServiceOffering model
ALTER TABLE "service_offerings" ADD COLUMN IF NOT EXISTS "deleted_at" TIMESTAMP(3);
CREATE INDEX IF NOT EXISTS "service_offerings_deleted_at_idx" ON "service_offerings"("deleted_at");

-- Note: HotelRoom.maxOccupancy and Vehicle.maxPassengers already exist in the schema
-- No migration needed for those fields
