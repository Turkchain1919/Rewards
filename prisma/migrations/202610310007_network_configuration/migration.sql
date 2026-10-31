-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "networkId" TEXT;

-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN     "networkId" TEXT;

-- CreateTable
CREATE TABLE "BlockchainNetwork" (
    "id" TEXT NOT NULL,
    "networkKey" TEXT NOT NULL,
    "networkName" TEXT NOT NULL,
    "chainId" TEXT NOT NULL,
    "config" JSONB NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "version" INTEGER NOT NULL DEFAULT 0,
    "verification" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BlockchainNetwork_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigDocument" (
    "key" TEXT NOT NULL,
    "value" JSONB NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConfigDocument_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "Credential" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "ciphertext" TEXT,
    "version" INTEGER NOT NULL DEFAULT 0,
    "revokedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Credential_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainNetwork_networkKey_key" ON "BlockchainNetwork"("networkKey");

-- CreateIndex
CREATE UNIQUE INDEX "BlockchainNetwork_chainId_key" ON "BlockchainNetwork"("chainId");

-- CreateIndex
CREATE UNIQUE INDEX "Credential_scope_ownerId_kind_key" ON "Credential"("scope", "ownerId", "kind");

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "BlockchainNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "BlockchainNetwork"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE UNIQUE INDEX "only_one_active_network" ON "BlockchainNetwork" ("isActive") WHERE "isActive" = true;
