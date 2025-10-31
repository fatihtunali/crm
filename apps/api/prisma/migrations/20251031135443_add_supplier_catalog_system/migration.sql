-- CreateEnum
CREATE TYPE "SupplierType" AS ENUM ('HOTEL', 'TRANSPORT', 'ACTIVITY_OPERATOR', 'GUIDE_AGENCY', 'OTHER');

-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('HOTEL_ROOM', 'TRANSFER', 'VEHICLE_HIRE', 'GUIDE_SERVICE', 'ACTIVITY');

-- CreateEnum
CREATE TYPE "BoardType" AS ENUM ('RO', 'BB', 'HB', 'FB', 'AI');

-- CreateEnum
CREATE TYPE "PricingModel" AS ENUM ('PER_ROOM_NIGHT', 'PER_PERSON_NIGHT', 'PER_TRANSFER', 'PER_KM', 'PER_HOUR', 'PER_DAY', 'PER_HALF_DAY', 'PER_PERSON', 'PER_GROUP');

-- CreateEnum
CREATE TYPE "TransferType" AS ENUM ('PRIVATE', 'SHARED', 'SHUTTLE');

-- AlterTable
ALTER TABLE "booking_items" ADD COLUMN     "pricing_snapshot_json" JSONB,
ADD COLUMN     "service_offering_id" INTEGER;

-- CreateTable
CREATE TABLE "parties" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "tax_id" VARCHAR(100),
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contacts" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "party_id" INTEGER NOT NULL,
    "contact_type" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "position" VARCHAR(100),
    "is_primary" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "party_id" INTEGER NOT NULL,
    "type" "SupplierType" NOT NULL,
    "bank_name" VARCHAR(255),
    "bank_account_no" VARCHAR(100),
    "bank_iban" VARCHAR(100),
    "bank_swift" VARCHAR(50),
    "payment_terms" VARCHAR(255),
    "default_currency" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "credit_limit" DECIMAL(12,2),
    "commission_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_offerings" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "supplier_id" INTEGER NOT NULL,
    "service_type" "ServiceType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "location" VARCHAR(255),
    "description" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_offerings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hotel_rooms" (
    "service_offering_id" INTEGER NOT NULL,
    "hotel_name" VARCHAR(255) NOT NULL,
    "stars" INTEGER,
    "address" TEXT,
    "city" VARCHAR(100),
    "country" VARCHAR(100),
    "geo" VARCHAR(100),
    "room_type" VARCHAR(100) NOT NULL,
    "max_occupancy" INTEGER NOT NULL DEFAULT 2,
    "board_types" JSONB,
    "amenities" JSONB,
    "check_in_time" VARCHAR(10),
    "check_out_time" VARCHAR(10),
    "cancellation_policy" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_rooms_pkey" PRIMARY KEY ("service_offering_id")
);

-- CreateTable
CREATE TABLE "hotel_room_rates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "service_offering_id" INTEGER NOT NULL,
    "season_from" DATE NOT NULL,
    "season_to" DATE NOT NULL,
    "pricing_model" "PricingModel" NOT NULL DEFAULT 'PER_ROOM_NIGHT',
    "board_type" "BoardType" NOT NULL,
    "occupancy_adults" INTEGER NOT NULL DEFAULT 2,
    "occupancy_children" INTEGER NOT NULL DEFAULT 0,
    "cost_try" DECIMAL(12,2) NOT NULL,
    "child_policy_json" JSONB,
    "allotment" INTEGER,
    "release_days" INTEGER,
    "min_stay" INTEGER DEFAULT 1,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hotel_room_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transfers" (
    "service_offering_id" INTEGER NOT NULL,
    "origin_zone" VARCHAR(255) NOT NULL,
    "dest_zone" VARCHAR(255) NOT NULL,
    "transfer_type" "TransferType" NOT NULL,
    "vehicle_class" VARCHAR(100) NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 4,
    "meet_greet" BOOLEAN NOT NULL DEFAULT false,
    "luggage_allowance" VARCHAR(100),
    "duration" INTEGER,
    "distance" DECIMAL(8,2),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfers_pkey" PRIMARY KEY ("service_offering_id")
);

-- CreateTable
CREATE TABLE "transfer_rates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "service_offering_id" INTEGER NOT NULL,
    "season_from" DATE NOT NULL,
    "season_to" DATE NOT NULL,
    "pricing_model" "PricingModel" NOT NULL DEFAULT 'PER_TRANSFER',
    "base_cost_try" DECIMAL(12,2) NOT NULL,
    "included_km" DECIMAL(8,2),
    "included_hours" DECIMAL(5,2),
    "extra_km_try" DECIMAL(8,2),
    "extra_hour_try" DECIMAL(8,2),
    "night_surcharge_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "holiday_surcharge_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "waiting_time_free" INTEGER DEFAULT 0,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transfer_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "service_offering_id" INTEGER NOT NULL,
    "make" VARCHAR(100) NOT NULL,
    "model" VARCHAR(100) NOT NULL,
    "year" INTEGER,
    "plate_number" VARCHAR(50),
    "seats" INTEGER NOT NULL DEFAULT 5,
    "vehicle_class" VARCHAR(100) NOT NULL,
    "transmission" VARCHAR(50),
    "fuel_type" VARCHAR(50),
    "with_driver" BOOLEAN NOT NULL DEFAULT false,
    "features" JSONB,
    "insurance_included" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("service_offering_id")
);

-- CreateTable
CREATE TABLE "vehicle_rates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "service_offering_id" INTEGER NOT NULL,
    "season_from" DATE NOT NULL,
    "season_to" DATE NOT NULL,
    "pricing_model" "PricingModel" NOT NULL DEFAULT 'PER_DAY',
    "base_cost_try" DECIMAL(12,2) NOT NULL,
    "daily_km_included" DECIMAL(8,2),
    "extra_km_try" DECIMAL(8,2),
    "driver_daily_try" DECIMAL(8,2),
    "one_way_fee_try" DECIMAL(8,2),
    "deposit_try" DECIMAL(12,2),
    "min_rental_days" INTEGER DEFAULT 1,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicle_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "guides" (
    "service_offering_id" INTEGER NOT NULL,
    "guide_name" VARCHAR(255) NOT NULL,
    "license_no" VARCHAR(100),
    "languages" JSONB NOT NULL,
    "regions" JSONB,
    "specializations" JSONB,
    "max_group_size" INTEGER DEFAULT 20,
    "rating" DECIMAL(3,2),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guides_pkey" PRIMARY KEY ("service_offering_id")
);

-- CreateTable
CREATE TABLE "guide_rates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "service_offering_id" INTEGER NOT NULL,
    "season_from" DATE NOT NULL,
    "season_to" DATE NOT NULL,
    "pricing_model" "PricingModel" NOT NULL DEFAULT 'PER_DAY',
    "day_cost_try" DECIMAL(12,2),
    "half_day_cost_try" DECIMAL(12,2),
    "hour_cost_try" DECIMAL(12,2),
    "overtime_hour_try" DECIMAL(12,2),
    "holiday_surcharge_pct" DECIMAL(5,2) NOT NULL DEFAULT 0,
    "min_hours" INTEGER DEFAULT 4,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "guide_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activities" (
    "service_offering_id" INTEGER NOT NULL,
    "operator_name" VARCHAR(255) NOT NULL,
    "activity_type" VARCHAR(100) NOT NULL,
    "duration_minutes" INTEGER,
    "capacity" INTEGER,
    "min_age" INTEGER,
    "max_age" INTEGER,
    "difficulty" VARCHAR(50),
    "included_items" JSONB,
    "meeting_point" TEXT,
    "pickup_available" BOOLEAN NOT NULL DEFAULT false,
    "cancellation_policy" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activities_pkey" PRIMARY KEY ("service_offering_id")
);

-- CreateTable
CREATE TABLE "activity_rates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "service_offering_id" INTEGER NOT NULL,
    "season_from" DATE NOT NULL,
    "season_to" DATE NOT NULL,
    "pricing_model" "PricingModel" NOT NULL DEFAULT 'PER_PERSON',
    "base_cost_try" DECIMAL(12,2) NOT NULL,
    "min_pax" INTEGER DEFAULT 1,
    "max_pax" INTEGER,
    "tiered_pricing_json" JSONB,
    "child_discount_pct" DECIMAL(5,2) DEFAULT 0,
    "group_discount_pct" DECIMAL(5,2) DEFAULT 0,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "activity_rates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "parties_tenant_id_idx" ON "parties"("tenant_id");

-- CreateIndex
CREATE INDEX "parties_name_idx" ON "parties"("name");

-- CreateIndex
CREATE INDEX "parties_is_active_idx" ON "parties"("is_active");

-- CreateIndex
CREATE INDEX "contacts_tenant_id_idx" ON "contacts"("tenant_id");

-- CreateIndex
CREATE INDEX "contacts_party_id_idx" ON "contacts"("party_id");

-- CreateIndex
CREATE INDEX "contacts_contact_type_idx" ON "contacts"("contact_type");

-- CreateIndex
CREATE INDEX "suppliers_tenant_id_idx" ON "suppliers"("tenant_id");

-- CreateIndex
CREATE INDEX "suppliers_party_id_idx" ON "suppliers"("party_id");

-- CreateIndex
CREATE INDEX "suppliers_type_idx" ON "suppliers"("type");

-- CreateIndex
CREATE INDEX "suppliers_is_active_idx" ON "suppliers"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_tenant_id_party_id_key" ON "suppliers"("tenant_id", "party_id");

-- CreateIndex
CREATE INDEX "service_offerings_tenant_id_idx" ON "service_offerings"("tenant_id");

-- CreateIndex
CREATE INDEX "service_offerings_supplier_id_idx" ON "service_offerings"("supplier_id");

-- CreateIndex
CREATE INDEX "service_offerings_service_type_idx" ON "service_offerings"("service_type");

-- CreateIndex
CREATE INDEX "service_offerings_is_active_idx" ON "service_offerings"("is_active");

-- CreateIndex
CREATE INDEX "service_offerings_location_idx" ON "service_offerings"("location");

-- CreateIndex
CREATE INDEX "hotel_room_rates_tenant_id_idx" ON "hotel_room_rates"("tenant_id");

-- CreateIndex
CREATE INDEX "hotel_room_rates_service_offering_id_idx" ON "hotel_room_rates"("service_offering_id");

-- CreateIndex
CREATE INDEX "hotel_room_rates_season_from_season_to_idx" ON "hotel_room_rates"("season_from", "season_to");

-- CreateIndex
CREATE INDEX "hotel_room_rates_board_type_idx" ON "hotel_room_rates"("board_type");

-- CreateIndex
CREATE INDEX "hotel_room_rates_is_active_idx" ON "hotel_room_rates"("is_active");

-- CreateIndex
CREATE INDEX "transfer_rates_tenant_id_idx" ON "transfer_rates"("tenant_id");

-- CreateIndex
CREATE INDEX "transfer_rates_service_offering_id_idx" ON "transfer_rates"("service_offering_id");

-- CreateIndex
CREATE INDEX "transfer_rates_season_from_season_to_idx" ON "transfer_rates"("season_from", "season_to");

-- CreateIndex
CREATE INDEX "transfer_rates_is_active_idx" ON "transfer_rates"("is_active");

-- CreateIndex
CREATE INDEX "vehicle_rates_tenant_id_idx" ON "vehicle_rates"("tenant_id");

-- CreateIndex
CREATE INDEX "vehicle_rates_service_offering_id_idx" ON "vehicle_rates"("service_offering_id");

-- CreateIndex
CREATE INDEX "vehicle_rates_season_from_season_to_idx" ON "vehicle_rates"("season_from", "season_to");

-- CreateIndex
CREATE INDEX "vehicle_rates_is_active_idx" ON "vehicle_rates"("is_active");

-- CreateIndex
CREATE INDEX "guide_rates_tenant_id_idx" ON "guide_rates"("tenant_id");

-- CreateIndex
CREATE INDEX "guide_rates_service_offering_id_idx" ON "guide_rates"("service_offering_id");

-- CreateIndex
CREATE INDEX "guide_rates_season_from_season_to_idx" ON "guide_rates"("season_from", "season_to");

-- CreateIndex
CREATE INDEX "guide_rates_is_active_idx" ON "guide_rates"("is_active");

-- CreateIndex
CREATE INDEX "activity_rates_tenant_id_idx" ON "activity_rates"("tenant_id");

-- CreateIndex
CREATE INDEX "activity_rates_service_offering_id_idx" ON "activity_rates"("service_offering_id");

-- CreateIndex
CREATE INDEX "activity_rates_season_from_season_to_idx" ON "activity_rates"("season_from", "season_to");

-- CreateIndex
CREATE INDEX "activity_rates_is_active_idx" ON "activity_rates"("is_active");

-- CreateIndex
CREATE INDEX "booking_items_service_offering_id_idx" ON "booking_items"("service_offering_id");

-- AddForeignKey
ALTER TABLE "parties" ADD CONSTRAINT "parties_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_offerings" ADD CONSTRAINT "service_offerings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_offerings" ADD CONSTRAINT "service_offerings_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_rooms" ADD CONSTRAINT "hotel_rooms_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_room_rates" ADD CONSTRAINT "hotel_room_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hotel_room_rates" ADD CONSTRAINT "hotel_room_rates_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_rates" ADD CONSTRAINT "transfer_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transfer_rates" ADD CONSTRAINT "transfer_rates_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_rates" ADD CONSTRAINT "vehicle_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicle_rates" ADD CONSTRAINT "vehicle_rates_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guides" ADD CONSTRAINT "guides_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_rates" ADD CONSTRAINT "guide_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "guide_rates" ADD CONSTRAINT "guide_rates_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activities" ADD CONSTRAINT "activities_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_rates" ADD CONSTRAINT "activity_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_rates" ADD CONSTRAINT "activity_rates_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_service_offering_id_fkey" FOREIGN KEY ("service_offering_id") REFERENCES "service_offerings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
