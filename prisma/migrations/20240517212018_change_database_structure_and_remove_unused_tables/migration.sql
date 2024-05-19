/*
  Warnings:

  - You are about to drop the column `clientDocument` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `clientId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the column `paymentClientId` on the `payments` table. All the data in the column will be lost.
  - You are about to drop the `requests` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "payments" DROP CONSTRAINT "payments_paymentClientId_fkey";

-- DropIndex
DROP INDEX "payments_paymentClientId_key";

-- AlterTable
ALTER TABLE "payments" DROP COLUMN "clientDocument",
DROP COLUMN "clientId",
DROP COLUMN "paymentClientId";

-- DropTable
DROP TABLE "requests";

-- AddForeignKey
ALTER TABLE "payment_client" ADD CONSTRAINT "payment_client_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
