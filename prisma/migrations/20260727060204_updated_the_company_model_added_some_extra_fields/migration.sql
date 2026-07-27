/*
  Warnings:

  - You are about to drop the column `logo` on the `company` table. All the data in the column will be lost.
  - You are about to drop the column `website` on the `company` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "company" DROP COLUMN "logo",
DROP COLUMN "website",
ADD COLUMN     "bannerUrl" TEXT,
ADD COLUMN     "facebookUrl" TEXT,
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "linkedinUrl" TEXT,
ADD COLUMN     "logoUrl" TEXT,
ADD COLUMN     "twitterUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;
