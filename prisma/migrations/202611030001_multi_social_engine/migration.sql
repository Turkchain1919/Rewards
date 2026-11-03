-- Additive multi-social metadata and independently bounded task accounting.
ALTER TABLE "Task" ADD COLUMN "socialTaskCode" TEXT,
 ADD COLUMN "targetObjectId" TEXT,
 ADD COLUMN "timezone" TEXT NOT NULL DEFAULT 'UTC',
 ADD COLUMN "budgetWei" DECIMAL(78,0),
 ADD COLUMN "allocatedWei" DECIMAL(78,0) NOT NULL DEFAULT 0;
UPDATE "Task" t SET "allocatedWei"=COALESCE((SELECT sum(e."amountWei") FROM "LedgerEntry" e JOIN "Submission" s ON s.id=e."submissionId" WHERE s."taskId"=t.id AND e.status!='REJECTED'),0);
ALTER TABLE "Task" ADD CONSTRAINT "task_budget_bounds" CHECK ("allocatedWei">=0 AND ("budgetWei" IS NULL OR ("budgetWei">=0 AND "allocatedWei"<="budgetWei")));
ALTER TABLE "IntegrationSetting" ADD COLUMN "requestedScopes" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[], ADD COLUMN "webhookEnabled" BOOLEAN NOT NULL DEFAULT false, ADD COLUMN "webhookVerifiedAt" TIMESTAMP(3);
CREATE TABLE "SocialRewardIdentity" (
 "id" TEXT NOT NULL, "taskId" TEXT NOT NULL, "userId" TEXT NOT NULL,
 "provider" TEXT NOT NULL, "accountHash" TEXT NOT NULL,
 "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "SocialRewardIdentity_pkey" PRIMARY KEY("id"),
 CONSTRAINT "SocialRewardIdentity_taskId_fkey" FOREIGN KEY("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "SocialRewardIdentity_userId_fkey" FOREIGN KEY("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SocialRewardIdentity_taskId_provider_accountHash_key" ON "SocialRewardIdentity"("taskId","provider","accountHash");
CREATE INDEX "SocialRewardIdentity_userId_idx" ON "SocialRewardIdentity"("userId");
-- Preserve an identity reservation for discoverable prior social rewards without touching ledger rows.
INSERT INTO "SocialRewardIdentity"("id","taskId","userId","provider","accountHash","createdAt")
SELECT DISTINCT ON (s."taskId",t.platform,sa."providerAccountId") e.id,s."taskId",e."userId",t.platform,encode(sha256(convert_to(t.platform||':'||sa."providerAccountId",'UTF8')),'hex'),e."createdAt"
FROM "LedgerEntry" e JOIN "Submission" s ON s.id=e."submissionId" JOIN "Task" t ON t.id=s."taskId" JOIN "SocialAccount" sa ON sa."userId"=e."userId" AND sa.provider=t.platform
WHERE e.status!='REJECTED' AND t.platform IN ('X','YOUTUBE','INSTAGRAM','TELEGRAM','FACEBOOK','KICK','TWITCH','TIKTOK')
ORDER BY s."taskId",t.platform,sa."providerAccountId",e."createdAt",e.id;
CREATE TABLE "SocialWebhookReceipt" (
 "id" TEXT NOT NULL, "platform" TEXT NOT NULL, "eventId" TEXT NOT NULL, "eventType" TEXT NOT NULL, "bodyHash" TEXT NOT NULL,
 "actorHash" TEXT, "targetObjectId" TEXT, "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 "occurredAt" TIMESTAMP(3) NOT NULL,"expiresAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "SocialWebhookReceipt_pkey" PRIMARY KEY("id")
);
CREATE UNIQUE INDEX "SocialWebhookReceipt_platform_eventId_key" ON "SocialWebhookReceipt"("platform","eventId");
CREATE INDEX "SocialWebhookReceipt_expiresAt_idx" ON "SocialWebhookReceipt"("expiresAt");
CREATE TABLE "SocialChallenge" (
 "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "taskId" TEXT NOT NULL, "officialAccountId" TEXT NOT NULL, "officialVersion" INTEGER NOT NULL,
 "providerAccountHash" TEXT NOT NULL,"tokenHash" TEXT NOT NULL,"expiresAt" TIMESTAMP(3) NOT NULL,
 "verifiedAt" TIMESTAMP(3),"consumedAt" TIMESTAMP(3),"receiptId" TEXT,"createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
 CONSTRAINT "SocialChallenge_pkey" PRIMARY KEY("id"),
 CONSTRAINT "SocialChallenge_userId_fkey" FOREIGN KEY("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "SocialChallenge_taskId_fkey" FOREIGN KEY("taskId") REFERENCES "Task"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
 CONSTRAINT "SocialChallenge_receiptId_fkey" FOREIGN KEY("receiptId") REFERENCES "SocialWebhookReceipt"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "SocialChallenge_tokenHash_key" ON "SocialChallenge"("tokenHash");
CREATE INDEX "SocialChallenge_expiresAt_idx" ON "SocialChallenge"("expiresAt");
CREATE INDEX "SocialChallenge_userId_taskId_idx" ON "SocialChallenge"("userId","taskId");
