-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('ACTIVE', 'BLOCKED', 'PENDING', 'REJECTED');

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING';
