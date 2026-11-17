-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tzOffset" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "UserTermState" ADD COLUMN     "hintsUsed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'NOT_STARTED';

-- CreateIndex
CREATE INDEX "UserTermState_userId_status_idx" ON "UserTermState"("userId", "status");
