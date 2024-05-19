/*
  Warnings:

  - You are about to drop the column `cardId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `payment_client` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `cardId` to the `payment_products` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "payment_client" DROP CONSTRAINT "payment_client_paymentId_fkey";

-- AlterTable
ALTER TABLE "payment_products" ADD COLUMN     "cardId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "cardId",
ADD COLUMN     "paymentClientId" TEXT;

-- DropTable
DROP TABLE "payment_client";

-- CreateTable
CREATE TABLE "payment_clients" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_clients_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_paymentClientId_fkey" FOREIGN KEY ("paymentClientId") REFERENCES "payment_clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
