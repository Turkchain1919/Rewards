-- AlterTable
ALTER TABLE "IntegrationSetting" ADD COLUMN     "callbackUrl" TEXT,
ADD COLUMN     "enabledOverride" BOOLEAN,
ADD COLUMN     "graphVersion" TEXT;

-- AlterTable
ALTER TABLE "SocialAccount" ADD COLUMN     "credentialId" TEXT,
ADD COLUMN     "lastError" TEXT,
ADD COLUMN     "lastRefreshAt" TIMESTAMP(3),
ALTER COLUMN "encryptedTokens" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Task" ADD COLUMN     "configurationRequired" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "officialAccountId" TEXT;

-- CreateTable
CREATE TABLE "OfficialSocialAccount" (
    "id" TEXT NOT NULL,
    "platform" TEXT NOT NULL,
    "accountType" TEXT NOT NULL DEFAULT 'PROFILE',
    "name" TEXT NOT NULL,
    "username" TEXT NOT NULL DEFAULT '',
    "accountId" TEXT NOT NULL DEFAULT '',
    "profileUrl" TEXT NOT NULL DEFAULT '',
    "defaultTargetUrl" TEXT NOT NULL DEFAULT '',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "connectionStatus" TEXT NOT NULL DEFAULT 'UNCONFIGURED',
    "credentialId" TEXT,
    "sourceKey" TEXT,
    "lastSuccessAt" TIMESTAMP(3),
    "lastError" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OfficialSocialAccount_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OfficialSocialAccount_sourceKey_key" ON "OfficialSocialAccount"("sourceKey");

-- CreateIndex
CREATE INDEX "OfficialSocialAccount_platform_idx" ON "OfficialSocialAccount"("platform");

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_officialAccountId_fkey" FOREIGN KEY ("officialAccountId") REFERENCES "OfficialSocialAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialAccount" ADD CONSTRAINT "SocialAccount_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OfficialSocialAccount" ADD CONSTRAINT "OfficialSocialAccount_credentialId_fkey" FOREIGN KEY ("credentialId") REFERENCES "Credential"("id") ON DELETE SET NULL ON UPDATE CASCADE;

