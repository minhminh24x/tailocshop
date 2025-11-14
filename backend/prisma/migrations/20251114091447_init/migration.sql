-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'STAFF', 'SUPPLIER', 'CUSTOMER');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PREPARING', 'READY_FOR_DELIVERY', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('UNPAID', 'PAID');

-- CreateEnum
CREATE TYPE "CurrencyType" AS ENUM ('USD', 'COIN');

-- CreateEnum
CREATE TYPE "ItemUnit" AS ENUM ('PIECE', 'STACK', 'SHULKER');

-- CreateEnum
CREATE TYPE "StockReason" AS ENUM ('SUPPLIER_SUBMISSION_APPROVED', 'ORDER_FULFILLED', 'ADMIN_ADJUSTMENT');

-- CreateTable
CREATE TABLE "vip_levels" (
    "level" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "coin_threshold" DECIMAL(12,2) NOT NULL,
    "discount_percent" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "vip_levels_pkey" PRIMARY KEY ("level")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" TEXT NOT NULL,
    "in_game_name" VARCHAR(100) NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'CUSTOMER',
    "total_spent_coin" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "must_change_password" BOOLEAN NOT NULL DEFAULT true,
    "vip_level" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "parent_id" UUID,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "items" (
    "id" UUID NOT NULL,
    "category_id" UUID,
    "name" VARCHAR(255) NOT NULL,
    "slug" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "thumbnail_image_url" TEXT,
    "unit" "ItemUnit" NOT NULL DEFAULT 'PIECE',
    "price_usd" DECIMAL(12,2),
    "price_coin" DECIMAL(12,2),
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "currency_exchange_rates" (
    "id" UUID NOT NULL,
    "rate" DECIMAL(15,2) NOT NULL,
    "rate_type" VARCHAR(50) NOT NULL,
    "updated_by" UUID,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "currency_exchange_rates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "delivery_time_slots" (
    "id" UUID NOT NULL,
    "display_text" VARCHAR(100) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "delivery_time_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" UUID NOT NULL,
    "order_number" TEXT,
    "customer_user_id" UUID,
    "in_game_name" VARCHAR(100) NOT NULL,
    "staff_user_id" UUID,
    "delivery_time_slot_id" UUID NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING',
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'UNPAID',
    "sub_total_coin" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "vip_discount_amount_coin" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount_coin" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "sub_total_usd" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total_amount_usd" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_details" (
    "id" UUID NOT NULL,
    "order_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit_at_purchase" "ItemUnit" NOT NULL,
    "currency_at_purchase" "CurrencyType" NOT NULL DEFAULT 'COIN',
    "price_at_purchase" DECIMAL(12,2) NOT NULL,
    "total_line_amount" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "order_details_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventory_logs" (
    "id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "order_id" UUID,
    "quantity_change" INTEGER NOT NULL,
    "new_stock_quantity" INTEGER NOT NULL,
    "reason" "StockReason" NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "inventory_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_submissions" (
    "id" UUID NOT NULL,
    "supplier_user_id" UUID NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    "approved_by_user_id" UUID,
    "supplier_notes" TEXT,
    "admin_notes" TEXT,
    "total_value_coin" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "supplier_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "supplier_submission_details" (
    "id" UUID NOT NULL,
    "submission_id" UUID NOT NULL,
    "item_id" UUID NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unit" "ItemUnit" NOT NULL,
    "suggested_price_per_unit_coin" DECIMAL(12,2) NOT NULL,
    "final_price_per_unit_coin" DECIMAL(12,2) NOT NULL,

    CONSTRAINT "supplier_submission_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_in_game_name_key" ON "users"("in_game_name");

-- CreateIndex
CREATE INDEX "users_in_game_name_idx" ON "users"("in_game_name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- CreateIndex
CREATE INDEX "items_category_id_idx" ON "items"("category_id");

-- CreateIndex
CREATE INDEX "items_slug_idx" ON "items"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "items_slug_unit_key" ON "items"("slug", "unit");

-- CreateIndex
CREATE UNIQUE INDEX "currency_exchange_rates_rate_type_key" ON "currency_exchange_rates"("rate_type");

-- CreateIndex
CREATE UNIQUE INDEX "orders_order_number_key" ON "orders"("order_number");

-- CreateIndex
CREATE INDEX "orders_customer_user_id_idx" ON "orders"("customer_user_id");

-- CreateIndex
CREATE INDEX "orders_status_idx" ON "orders"("status");

-- CreateIndex
CREATE INDEX "supplier_submissions_supplier_user_id_idx" ON "supplier_submissions"("supplier_user_id");

-- CreateIndex
CREATE INDEX "supplier_submissions_status_idx" ON "supplier_submissions"("status");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_vip_level_fkey" FOREIGN KEY ("vip_level") REFERENCES "vip_levels"("level") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "items" ADD CONSTRAINT "items_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "currency_exchange_rates" ADD CONSTRAINT "currency_exchange_rates_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_customer_user_id_fkey" FOREIGN KEY ("customer_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_staff_user_id_fkey" FOREIGN KEY ("staff_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_delivery_time_slot_id_fkey" FOREIGN KEY ("delivery_time_slot_id") REFERENCES "delivery_time_slots"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_details" ADD CONSTRAINT "order_details_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_details" ADD CONSTRAINT "order_details_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory_logs" ADD CONSTRAINT "inventory_logs_order_id_fkey" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_submissions" ADD CONSTRAINT "supplier_submissions_supplier_user_id_fkey" FOREIGN KEY ("supplier_user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_submissions" ADD CONSTRAINT "supplier_submissions_approved_by_user_id_fkey" FOREIGN KEY ("approved_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_submission_details" ADD CONSTRAINT "supplier_submission_details_submission_id_fkey" FOREIGN KEY ("submission_id") REFERENCES "supplier_submissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "supplier_submission_details" ADD CONSTRAINT "supplier_submission_details_item_id_fkey" FOREIGN KEY ("item_id") REFERENCES "items"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
