CREATE TABLE "HeroVisual" (
 "id" TEXT NOT NULL DEFAULT 'homepage',
 "filename" TEXT NOT NULL,
 "contentType" TEXT NOT NULL DEFAULT 'image/gif',
 "bytes" BYTEA NOT NULL,
 "size" INTEGER NOT NULL,
 "width" INTEGER NOT NULL,
 "height" INTEGER NOT NULL,
 "frameCount" INTEGER NOT NULL,
 "sha256" TEXT NOT NULL,
 "published" BOOLEAN NOT NULL DEFAULT false,
 "enabled" BOOLEAN NOT NULL DEFAULT false,
 "updatedAt" TIMESTAMP(3) NOT NULL,
 CONSTRAINT "HeroVisual_pkey" PRIMARY KEY ("id")
);
