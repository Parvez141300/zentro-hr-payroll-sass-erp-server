/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `company` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[email]` on the table `company` will be added. If there are existing duplicate values, this will fail.
  - Made the column `email` on table `company` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "company" ALTER COLUMN "email" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "company_name_key" ON "company"("name");

-- CreateIndex
CREATE UNIQUE INDEX "company_email_key" ON "company"("email");
