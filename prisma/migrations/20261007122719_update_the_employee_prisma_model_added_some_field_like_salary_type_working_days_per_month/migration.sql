-- CreateEnum
CREATE TYPE "SalaryType" AS ENUM ('MONTHLY', 'DAILY', 'HOURLY');

-- AlterTable
ALTER TABLE "employee" ADD COLUMN     "salaryType" "SalaryType" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "workingDaysPerMonth" INTEGER NOT NULL DEFAULT 22;
