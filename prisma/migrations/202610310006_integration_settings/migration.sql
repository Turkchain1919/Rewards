-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "targetUrl" TEXT;

-- CreateTable
CREATE TABLE "IntegrationSetting" (
    "platform" TEXT NOT NULL,
    "disabled" BOOLEAN NOT NULL DEFAULT false,
    "name" TEXT,
    "profileUrl" TEXT,
    "accountId" TEXT,
    "defaultTargetUrl" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "lastTestAt" TIMESTAMP(3),
    "lastSuccessAt" TIMESTAMP(3),
    "lastTestStatus" TEXT,
    "lastError" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "IntegrationSetting_pkey" PRIMARY KEY ("platform")
);

