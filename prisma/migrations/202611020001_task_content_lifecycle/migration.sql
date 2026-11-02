ALTER TABLE "Campaign"
  ADD COLUMN "archivedAt" TIMESTAMP(3);

ALTER TABLE "Task"
  ADD COLUMN "localizedContent" JSONB,
  ADD COLUMN "startsAt" TIMESTAMP(3),
  ADD COLUMN "endsAt" TIMESTAMP(3),
  ADD COLUMN "publishedAt" TIMESTAMP(3),
  ADD COLUMN "archivedAt" TIMESTAMP(3);

UPDATE "Task" AS task
SET "publishedAt" = COALESCE(
  (SELECT MIN(event."createdAt")
   FROM "AuditEvent" AS event
   WHERE event."action" = 'TASK_PUBLISH' AND event."resource" = task."id"),
  CURRENT_TIMESTAMP
)
WHERE task."enabled" = TRUE
   OR EXISTS (
     SELECT 1 FROM "AuditEvent" AS event
     WHERE event."action" = 'TASK_PUBLISH' AND event."resource" = task."id"
   );

CREATE INDEX "Task_campaignId_archivedAt_idx" ON "Task"("campaignId", "archivedAt");
CREATE INDEX "Campaign_archivedAt_idx" ON "Campaign"("archivedAt");
