-- CreateTable
CREATE TABLE "SocialLinkState" (
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "generation" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SocialLinkState_pkey" PRIMARY KEY ("userId","provider")
);

-- AddForeignKey
ALTER TABLE "SocialLinkState" ADD CONSTRAINT "SocialLinkState_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

