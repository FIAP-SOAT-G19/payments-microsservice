/*
  Warnings:

  - Added the required column `cardId` to the `payment_products` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_products" ADD COLUMN     "cardId" TEXT NOT NULL;
