/*
  Warnings:

  - You are about to drop the `payment_clients` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `paymentClientId` on table `payments` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_paymentClientId_fkey";

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "paymentClientId" SET NOT NULL;

-- DropTable
DROP TABLE "payment_clients";

-- CreateTable
CREATE TABLE "payment_client" (
    "id" TEXT NOT NULL,
    "paymentId" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cpf" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_client_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "payment_client" ADD CONSTRAINT "payment_client_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
