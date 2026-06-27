/*
  Warnings:

  - You are about to drop the column `fullName` on the `accountant` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `department_head` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `employee` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `hr_manager` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `platform_super_admin` table. All the data in the column will be lost.
  - You are about to drop the column `fullName` on the `super_admin` table. All the data in the column will be lost.
  - Added the required column `name` to the `accountant` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `department_head` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `hr_manager` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `platform_super_admin` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `super_admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "accountant" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "department_head" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "employee" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "hr_manager" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "platform_super_admin" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "super_admin" DROP COLUMN "fullName",
ADD COLUMN     "name" TEXT NOT NULL;
