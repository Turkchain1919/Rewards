-- AlterTable
ALTER TABLE "IntegrationSetting" ADD COLUMN     "authMode" TEXT NOT NULL DEFAULT 'oauth',
ADD COLUMN     "credentialsUpdatedAt" TIMESTAMP(3);

