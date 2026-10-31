ALTER TABLE "Campaign" ADD CONSTRAINT "campaign_budget_bounds" CHECK ("budgetWei">=0 AND "allocatedWei">=0 AND "allocatedWei"<="budgetWei");
ALTER TABLE "Task" ADD CONSTRAINT "task_reward_nonnegative" CHECK ("rewardWei">=0);
ALTER TABLE "LedgerEntry" ADD CONSTRAINT "ledger_reward_positive" CHECK ("amountWei">0);
