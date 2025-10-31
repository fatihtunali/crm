-- Delete existing hotel room rates (test data only - 3 rows)
DELETE FROM "hotel_room_rates";

-- AlterTable: Drop old columns and add new pricing structure
ALTER TABLE "hotel_room_rates"
  DROP COLUMN "pricing_model",
  DROP COLUMN "occupancy_adults",
  DROP COLUMN "occupancy_children",
  DROP COLUMN "cost_try",
  DROP COLUMN "child_policy_json",
  ADD COLUMN "price_per_person_double" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "single_supplement" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "price_per_person_triple" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "child_price_0_to_2" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "child_price_3_to_5" DECIMAL(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN "child_price_6_to_11" DECIMAL(12,2) NOT NULL DEFAULT 0;

-- Remove defaults after adding columns
ALTER TABLE "hotel_room_rates"
  ALTER COLUMN "price_per_person_double" DROP DEFAULT,
  ALTER COLUMN "single_supplement" DROP DEFAULT,
  ALTER COLUMN "price_per_person_triple" DROP DEFAULT,
  ALTER COLUMN "child_price_0_to_2" DROP DEFAULT,
  ALTER COLUMN "child_price_3_to_5" DROP DEFAULT,
  ALTER COLUMN "child_price_6_to_11" DROP DEFAULT;
