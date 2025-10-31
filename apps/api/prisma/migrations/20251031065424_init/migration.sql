-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'AGENT', 'OPERATIONS', 'ACCOUNTING', 'GUIDE', 'VENDOR');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUOTED', 'WON', 'LOST');

-- CreateEnum
CREATE TYPE "VendorType" AS ENUM ('HOTEL', 'TRANSPORT', 'GUIDE', 'ACTIVITY');

-- CreateEnum
CREATE TYPE "QuotationStatus" AS ENUM ('DRAFT', 'SENT', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "ItemType" AS ENUM ('HOTEL', 'TRANSFER', 'GUIDE', 'ACTIVITY', 'FEE', 'DISCOUNT');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CREDIT_CARD', 'BANK_TRANSFER', 'ONLINE', 'OTHER');

-- CreateTable
CREATE TABLE "tenants" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "branding_logo_url" VARCHAR(500),
    "default_currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "tax_id" VARCHAR(100),
    "address" TEXT,
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tenants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'AGENT',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "phone" VARCHAR(50),
    "nationality" VARCHAR(100),
    "preferred_language" VARCHAR(10) NOT NULL DEFAULT 'en',
    "passport_number" VARCHAR(50),
    "date_of_birth" DATE,
    "notes" TEXT,
    "tags" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "client_id" INTEGER,
    "source" VARCHAR(100),
    "inquiry_date" TIMESTAMP(3) NOT NULL,
    "destination" VARCHAR(255),
    "pax_adults" INTEGER NOT NULL DEFAULT 0,
    "pax_children" INTEGER NOT NULL DEFAULT 0,
    "budget_eur" DECIMAL(12,2),
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tours" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "base_capacity" INTEGER NOT NULL DEFAULT 1,
    "season_start" DATE,
    "season_end" DATE,
    "default_markup_pct" DECIMAL(5,2) NOT NULL DEFAULT 25.00,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "itineraries" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "tour_id" INTEGER NOT NULL,
    "day_number" INTEGER NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "transport" VARCHAR(255),
    "accommodation" VARCHAR(255),
    "meals" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "type" "VendorType" NOT NULL,
    "contact_name" VARCHAR(255),
    "phone" VARCHAR(50),
    "email" VARCHAR(255),
    "tax_id" VARCHAR(100),
    "address" TEXT,
    "notes" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_rates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "season_from" DATE NOT NULL,
    "season_to" DATE NOT NULL,
    "service_type" VARCHAR(100) NOT NULL,
    "cost_try" DECIMAL(12,2) NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vendor_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exchange_rates" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "from_currency" VARCHAR(3) NOT NULL DEFAULT 'TRY',
    "to_currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "rate" DECIMAL(10,4) NOT NULL,
    "rate_date" DATE NOT NULL,
    "source" VARCHAR(100) NOT NULL DEFAULT 'manual',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quotations" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "lead_id" INTEGER,
    "tour_id" INTEGER,
    "custom_json" JSONB,
    "calc_cost_try" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sell_price_eur" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "exchange_rate_used" DECIMAL(10,4) NOT NULL,
    "valid_until" TIMESTAMP(3),
    "status" "QuotationStatus" NOT NULL DEFAULT 'DRAFT',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "quotations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "quotation_id" INTEGER,
    "client_id" INTEGER NOT NULL,
    "booking_code" VARCHAR(50) NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "locked_exchange_rate" DECIMAL(10,4) NOT NULL,
    "total_cost_try" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_sell_eur" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "deposit_due_eur" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "balance_due_eur" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "booking_items" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "item_type" "ItemType" NOT NULL,
    "vendor_id" INTEGER,
    "qty" INTEGER NOT NULL DEFAULT 1,
    "unit_cost_try" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "unit_price_eur" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "booking_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments_client" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "amount_eur" DECIMAL(12,2) NOT NULL,
    "method" "PaymentMethod" NOT NULL,
    "paid_at" TIMESTAMP(3) NOT NULL,
    "txn_ref" VARCHAR(255),
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_client_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments_vendor" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "vendor_id" INTEGER NOT NULL,
    "amount_try" DECIMAL(12,2) NOT NULL,
    "due_at" TIMESTAMP(3) NOT NULL,
    "paid_at" TIMESTAMP(3),
    "status" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_vendor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "invoices" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "booking_id" INTEGER NOT NULL,
    "number" VARCHAR(100) NOT NULL,
    "issue_date" DATE NOT NULL,
    "currency" VARCHAR(3) NOT NULL DEFAULT 'EUR',
    "net_amount" DECIMAL(12,2) NOT NULL,
    "vat_amount" DECIMAL(12,2) NOT NULL,
    "gross_amount" DECIMAL(12,2) NOT NULL,
    "vat_rate" DECIMAL(5,2) NOT NULL DEFAULT 20.00,
    "pdf_url" VARCHAR(500),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "tenant_id" INTEGER NOT NULL,
    "user_id" INTEGER,
    "entity" VARCHAR(100) NOT NULL,
    "entity_id" INTEGER NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "diff_json" JSONB,
    "ip_address" VARCHAR(45),
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "tenants_code_key" ON "tenants"("code");

-- CreateIndex
CREATE INDEX "tenants_code_idx" ON "tenants"("code");

-- CreateIndex
CREATE INDEX "tenants_is_active_idx" ON "tenants"("is_active");

-- CreateIndex
CREATE INDEX "users_tenant_id_idx" ON "users"("tenant_id");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE UNIQUE INDEX "users_tenant_id_email_key" ON "users"("tenant_id", "email");

-- CreateIndex
CREATE INDEX "clients_tenant_id_idx" ON "clients"("tenant_id");

-- CreateIndex
CREATE INDEX "clients_email_idx" ON "clients"("email");

-- CreateIndex
CREATE INDEX "clients_name_idx" ON "clients"("name");

-- CreateIndex
CREATE INDEX "leads_tenant_id_idx" ON "leads"("tenant_id");

-- CreateIndex
CREATE INDEX "leads_client_id_idx" ON "leads"("client_id");

-- CreateIndex
CREATE INDEX "leads_status_idx" ON "leads"("status");

-- CreateIndex
CREATE INDEX "leads_inquiry_date_idx" ON "leads"("inquiry_date");

-- CreateIndex
CREATE INDEX "tours_tenant_id_idx" ON "tours"("tenant_id");

-- CreateIndex
CREATE INDEX "tours_is_active_idx" ON "tours"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "tours_tenant_id_code_key" ON "tours"("tenant_id", "code");

-- CreateIndex
CREATE INDEX "itineraries_tenant_id_idx" ON "itineraries"("tenant_id");

-- CreateIndex
CREATE INDEX "itineraries_tour_id_idx" ON "itineraries"("tour_id");

-- CreateIndex
CREATE INDEX "itineraries_day_number_idx" ON "itineraries"("day_number");

-- CreateIndex
CREATE INDEX "vendors_tenant_id_idx" ON "vendors"("tenant_id");

-- CreateIndex
CREATE INDEX "vendors_type_idx" ON "vendors"("type");

-- CreateIndex
CREATE INDEX "vendors_is_active_idx" ON "vendors"("is_active");

-- CreateIndex
CREATE INDEX "vendor_rates_tenant_id_idx" ON "vendor_rates"("tenant_id");

-- CreateIndex
CREATE INDEX "vendor_rates_vendor_id_idx" ON "vendor_rates"("vendor_id");

-- CreateIndex
CREATE INDEX "vendor_rates_season_from_season_to_idx" ON "vendor_rates"("season_from", "season_to");

-- CreateIndex
CREATE INDEX "exchange_rates_tenant_id_idx" ON "exchange_rates"("tenant_id");

-- CreateIndex
CREATE INDEX "exchange_rates_rate_date_idx" ON "exchange_rates"("rate_date");

-- CreateIndex
CREATE UNIQUE INDEX "exchange_rates_tenant_id_from_currency_to_currency_rate_dat_key" ON "exchange_rates"("tenant_id", "from_currency", "to_currency", "rate_date");

-- CreateIndex
CREATE INDEX "quotations_tenant_id_idx" ON "quotations"("tenant_id");

-- CreateIndex
CREATE INDEX "quotations_lead_id_idx" ON "quotations"("lead_id");

-- CreateIndex
CREATE INDEX "quotations_status_idx" ON "quotations"("status");

-- CreateIndex
CREATE INDEX "bookings_tenant_id_idx" ON "bookings"("tenant_id");

-- CreateIndex
CREATE INDEX "bookings_client_id_idx" ON "bookings"("client_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_start_date_end_date_idx" ON "bookings"("start_date", "end_date");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_tenant_id_booking_code_key" ON "bookings"("tenant_id", "booking_code");

-- CreateIndex
CREATE INDEX "booking_items_tenant_id_idx" ON "booking_items"("tenant_id");

-- CreateIndex
CREATE INDEX "booking_items_booking_id_idx" ON "booking_items"("booking_id");

-- CreateIndex
CREATE INDEX "booking_items_vendor_id_idx" ON "booking_items"("vendor_id");

-- CreateIndex
CREATE INDEX "payments_client_tenant_id_idx" ON "payments_client"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_client_booking_id_idx" ON "payments_client"("booking_id");

-- CreateIndex
CREATE INDEX "payments_client_paid_at_idx" ON "payments_client"("paid_at");

-- CreateIndex
CREATE INDEX "payments_vendor_tenant_id_idx" ON "payments_vendor"("tenant_id");

-- CreateIndex
CREATE INDEX "payments_vendor_booking_id_idx" ON "payments_vendor"("booking_id");

-- CreateIndex
CREATE INDEX "payments_vendor_vendor_id_idx" ON "payments_vendor"("vendor_id");

-- CreateIndex
CREATE INDEX "payments_vendor_due_at_idx" ON "payments_vendor"("due_at");

-- CreateIndex
CREATE INDEX "invoices_tenant_id_idx" ON "invoices"("tenant_id");

-- CreateIndex
CREATE INDEX "invoices_booking_id_idx" ON "invoices"("booking_id");

-- CreateIndex
CREATE INDEX "invoices_issue_date_idx" ON "invoices"("issue_date");

-- CreateIndex
CREATE UNIQUE INDEX "invoices_tenant_id_number_key" ON "invoices"("tenant_id", "number");

-- CreateIndex
CREATE INDEX "audit_logs_tenant_id_idx" ON "audit_logs"("tenant_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entity_id_idx" ON "audit_logs"("entity", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "clients" ADD CONSTRAINT "clients_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tours" ADD CONSTRAINT "tours_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "itineraries" ADD CONSTRAINT "itineraries_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendors" ADD CONSTRAINT "vendors_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_rates" ADD CONSTRAINT "vendor_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_rates" ADD CONSTRAINT "vendor_rates_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exchange_rates" ADD CONSTRAINT "exchange_rates_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "quotations" ADD CONSTRAINT "quotations_tour_id_fkey" FOREIGN KEY ("tour_id") REFERENCES "tours"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_quotation_id_fkey" FOREIGN KEY ("quotation_id") REFERENCES "quotations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "booking_items" ADD CONSTRAINT "booking_items_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_client" ADD CONSTRAINT "payments_client_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_client" ADD CONSTRAINT "payments_client_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_vendor" ADD CONSTRAINT "payments_vendor_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_vendor" ADD CONSTRAINT "payments_vendor_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments_vendor" ADD CONSTRAINT "payments_vendor_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_booking_id_fkey" FOREIGN KEY ("booking_id") REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_tenant_id_fkey" FOREIGN KEY ("tenant_id") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
