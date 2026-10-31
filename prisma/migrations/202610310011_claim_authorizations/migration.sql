-- AlterTable
ALTER TABLE "LedgerEntry" ADD COLUMN     "claimId" TEXT;

-- CreateTable
CREATE TABLE "ClaimAuthorization" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "networkId" TEXT NOT NULL,
    "recipient" TEXT NOT NULL,
    "amountWei" DECIMAL(78,0) NOT NULL,
    "nonce" TEXT NOT NULL,
    "deadline" TIMESTAMP(3) NOT NULL,
    "createdBlock" TEXT NOT NULL,
    "lastScannedBlock" TEXT,
    "contractAddress" TEXT NOT NULL,
    "bytecodeHash" TEXT NOT NULL,
    "authorization" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PREPARED',
    "transactionHash" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "lastError" TEXT,
    "checkedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ClaimAuthorization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ClaimAuthorization_nonce_key" ON "ClaimAuthorization"("nonce");

-- CreateIndex
CREATE INDEX "ClaimAuthorization_networkId_status_idx" ON "ClaimAuthorization"("networkId", "status");

-- AddForeignKey
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "LedgerEntry_claimId_fkey" FOREIGN KEY ("claimId") REFERENCES "ClaimAuthorization"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAuthorization" ADD CONSTRAINT "ClaimAuthorization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ClaimAuthorization" ADD CONSTRAINT "ClaimAuthorization_networkId_fkey" FOREIGN KEY ("networkId") REFERENCES "BlockchainNetwork"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

