-- CreateEnum
CREATE TYPE "CaseOutcome" AS ENUM ('survived', 'deteriorated', 'died');

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "heartsRemaining" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "outcome" "CaseOutcome",
ADD COLUMN     "timeElapsed" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Case" ADD COLUMN     "timeLimit" INTEGER;
