-- DropForeignKey
ALTER TABLE "polices" DROP CONSTRAINT "polices_userId_fkey";

-- DropForeignKey
ALTER TABLE "vehicules" DROP CONSTRAINT "vehicules_userId_fkey";

-- AlterTable
ALTER TABLE "polices" ALTER COLUMN "userId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "vehicules" ALTER COLUMN "userId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "polices_userId_idx" ON "polices"("userId");

-- AddForeignKey
ALTER TABLE "vehicules" ADD CONSTRAINT "vehicules_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polices" ADD CONSTRAINT "polices_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
