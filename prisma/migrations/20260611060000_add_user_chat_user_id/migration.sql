-- AlterTable
ALTER TABLE "User" ADD COLUMN     "chatUserId" BIGINT;

-- CreateIndex
CREATE UNIQUE INDEX "User_chatUserId_key" ON "User"("chatUserId");
