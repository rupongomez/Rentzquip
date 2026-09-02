/*
  Warnings:

  - The values [SUPER_ADMIN,USER] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `Organization` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `OrganizationMembers` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[googleId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('GOOGLE', 'CREDENTIALS');

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('ADMIN', 'MODERATOR', 'PROVIDER', 'CUSTOMER');
ALTER TABLE "public"."users" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "users" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "public"."Role_old";
ALTER TABLE "users" ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';
COMMIT;

-- DropForeignKey
ALTER TABLE "OrganizationMembers" DROP CONSTRAINT "OrganizationMembers_organizationId_fkey";

-- DropForeignKey
ALTER TABLE "OrganizationMembers" DROP CONSTRAINT "OrganizationMembers_userId_fkey";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "authProvider" "AuthProvider" NOT NULL DEFAULT 'CREDENTIALS',
ADD COLUMN     "contactNumber" TEXT,
ADD COLUMN     "googleId" TEXT,
ALTER COLUMN "password" DROP NOT NULL,
ALTER COLUMN "role" SET DEFAULT 'CUSTOMER';

-- DropTable
DROP TABLE "Organization";

-- DropTable
DROP TABLE "OrganizationMembers";

-- DropEnum
DROP TYPE "OrganizationRole";

-- CreateIndex
CREATE UNIQUE INDEX "users_googleId_key" ON "users"("googleId");
