/*
  Warnings:

  - You are about to drop the column `currency_used` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `sub_total` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `total_amount` on the `orders` table. All the data in the column will be lost.
  - You are about to drop the column `vip_discount_amount` on the `orders` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "order_details" ADD COLUMN     "currency_at_purchase" "CurrencyType" NOT NULL DEFAULT 'COIN';

-- AlterTable
ALTER TABLE "orders" DROP COLUMN "currency_used",
DROP COLUMN "sub_total",
DROP COLUMN "total_amount",
DROP COLUMN "vip_discount_amount",
ADD COLUMN     "sub_total_coin" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "sub_total_usd" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_amount_coin" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "total_amount_usd" DECIMAL(12,2) NOT NULL DEFAULT 0,
ADD COLUMN     "vip_discount_amount_coin" DECIMAL(12,2) NOT NULL DEFAULT 0;
