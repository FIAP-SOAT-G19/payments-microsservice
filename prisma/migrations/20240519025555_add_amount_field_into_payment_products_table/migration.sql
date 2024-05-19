/*
  Warnings:

  - Added the required column `amount` to the `payment_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_products" ADD COLUMN     "amount" INTEGER NOT NULL;
