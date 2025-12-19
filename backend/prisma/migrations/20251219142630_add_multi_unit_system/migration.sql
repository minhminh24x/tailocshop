-- Migration: Add Multi-Unit System
-- This migration adds support for multiple units (PIECE, STACK, SHULKER)

-- Add new columns to items table
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "allowed_units" TEXT[] DEFAULT ARRAY['PIECE']::TEXT[];
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "base_unit" "ItemUnit" NOT NULL DEFAULT 'PIECE';
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "base_price_coin" DECIMAL(12,2);
ALTER TABLE "items" ADD COLUMN IF NOT EXISTS "base_price_usd" DECIMAL(12,2);

-- Copy existing prices to new columns for backward compatibility
UPDATE "items" SET 
  "base_price_coin" = "price_coin",
  "base_price_usd" = "price_usd"
WHERE "base_price_coin" IS NULL;

-- Set allowed_units based on existing unit column (if it exists)
-- Since we're changing from single unit to multi-unit, default to the current unit
UPDATE "items" SET "allowed_units" = ARRAY['PIECE']::TEXT[] WHERE "allowed_units" IS NULL OR "allowed_units" = '{}';

-- Drop the old unique constraint on (slug, unit) if exists
-- Note: This constraint name may vary, adjust as needed
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'items_slug_unit_key') THEN
        ALTER TABLE "items" DROP CONSTRAINT "items_slug_unit_key";
    END IF;
END $$;

-- Add unique constraint on slug only
-- First check if there are duplicate slugs (this would fail the migration)
-- If there are duplicates, they need to be resolved manually first

-- Create unique index on slug (if it doesn't exist)
CREATE UNIQUE INDEX IF NOT EXISTS "items_slug_key" ON "items"("slug");
