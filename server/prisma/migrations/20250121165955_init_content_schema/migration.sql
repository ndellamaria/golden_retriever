-- CreateEnum
CREATE TYPE "ContentType" AS ENUM ('BLOG', 'RESEARCH_PAPER', 'PDF', 'BOOK');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'ON_HOLD');

-- CreateTable
CREATE TABLE "Content" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ContentType" NOT NULL,
    "authors" TEXT[],
    "description" TEXT,
    "fileUrl" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "finishedAt" TIMESTAMP(3),
    "progress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'IN_PROGRESS',

    CONSTRAINT "Content_pkey" PRIMARY KEY ("id")
);
