/*
  Warnings:

  - Added the required column `salaryType` to the `payroll` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "payroll" ADD COLUMN     "salaryType" "SalaryType" NOT NULL,
ADD COLUMN     "workingDaysPerMonth" DOUBLE PRECISION NOT NULL DEFAULT 22;
