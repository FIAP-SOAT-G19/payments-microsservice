/*
  Warnings:

  - A unique constraint covering the columns `[paymentId]` on the table `payment_client` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "payment_client_paymentId_key" ON "payment_client"("paymentId");
