-- DropIndex
DROP INDEX "company_email_id_idx";

-- CreateTable
CREATE TABLE "platform_super_admin" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "platform_super_admin_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "platform_super_admin_userId_key" ON "platform_super_admin"("userId");

-- CreateIndex
CREATE INDEX "idx_platform_super_admin_id" ON "platform_super_admin"("id");

-- CreateIndex
CREATE INDEX "idx_platform_super_admin_email" ON "platform_super_admin"("email");

-- CreateIndex
CREATE INDEX "idx_company_email" ON "company"("email");

-- CreateIndex
CREATE INDEX "idx_company_id" ON "company"("id");

-- CreateIndex
CREATE INDEX "idx_doctor_isDeleted" ON "company"("isDeleted");

-- CreateIndex
CREATE INDEX "idx_user_id" ON "user"("id");

-- CreateIndex
CREATE INDEX "idx_user_email" ON "user"("email");

-- AddForeignKey
ALTER TABLE "platform_super_admin" ADD CONSTRAINT "platform_super_admin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
