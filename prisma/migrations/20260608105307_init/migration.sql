-- CreateEnum
CREATE TYPE "BonsaiStatus" AS ENUM ('active', 'expired');

-- CreateEnum
CREATE TYPE "BonsaiType" AS ENUM ('purchased', 'collected', 'field');

-- CreateTable
CREATE TABLE "BonsaiTree" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "species" TEXT NOT NULL,
    "initialCost" DOUBLE PRECISION NOT NULL,
    "acquisitionDate" DATE NOT NULL,
    "status" "BonsaiStatus" NOT NULL,
    "type" "BonsaiType" NOT NULL,
    "location" TEXT,
    "potType" TEXT,
    "age" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BonsaiTree_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonsaiEvent" (
    "id" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "value" DOUBLE PRECISION,
    "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "bonsaiId" TEXT NOT NULL,

    CONSTRAINT "BonsaiEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BonsaiPhoto" (
    "id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "contentType" TEXT,
    "uploadedAt" TIMESTAMP(3) NOT NULL,
    "takenAt" TIMESTAMP(3),
    "width" INTEGER,
    "height" INTEGER,
    "source" TEXT,
    "storagePath" TEXT,
    "bonsaiId" TEXT NOT NULL,

    CONSTRAINT "BonsaiPhoto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RepotList" (
    "userId" TEXT NOT NULL,
    "treeIds" TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RepotList_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "GlobalNotes" (
    "id" TEXT NOT NULL DEFAULT 'notes',
    "notes" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "GlobalNotes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BonsaiEvent_bonsaiId_idx" ON "BonsaiEvent"("bonsaiId");

-- CreateIndex
CREATE INDEX "BonsaiPhoto_bonsaiId_idx" ON "BonsaiPhoto"("bonsaiId");

-- AddForeignKey
ALTER TABLE "BonsaiEvent" ADD CONSTRAINT "BonsaiEvent_bonsaiId_fkey" FOREIGN KEY ("bonsaiId") REFERENCES "BonsaiTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BonsaiPhoto" ADD CONSTRAINT "BonsaiPhoto_bonsaiId_fkey" FOREIGN KEY ("bonsaiId") REFERENCES "BonsaiTree"("id") ON DELETE CASCADE ON UPDATE CASCADE;
