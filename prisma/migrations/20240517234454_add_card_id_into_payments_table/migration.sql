/*
  Warnings:

  - You are about to drop the column `cardId` on the `payment_products` table. All the data in the column will be lost.
  - Added the required column `cardId` to the `payments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payment_products" DROP COLUMN "cardId";

-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "cardId" TEXT NOT NULL;
