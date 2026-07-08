/*
  Warnings:

  - You are about to drop the column `pdfUrl` on the `payment` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "payment" DROP COLUMN "pdfUrl",
ADD COLUMN     "invoiceUrl" TEXT;
