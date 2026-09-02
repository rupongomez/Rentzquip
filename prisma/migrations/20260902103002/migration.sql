/*
  Warnings:

  - The values [USER] on the enum `OrganizationRole` will be removed. If these variants are still used in the database, this will fail.

*/
-- CreateEnum
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER');

-- AlterEnum
BEGIN;
CREATE TYPE "OrganizationRole_new" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'DEVELOPER', 'MEMBER', 'GUEST');
ALTER TABLE "public"."OrganizationMembers" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "OrganizationMembers" ALTER COLUMN "role" TYPE "OrganizationRole_new" USING ("role"::text::"OrganizationRole_new");
ALTER TYPE "OrganizationRole" RENAME TO "OrganizationRole_old";
ALTER TYPE "OrganizationRole_new" RENAME TO "OrganizationRole";
DROP TYPE "public"."OrganizationRole_old";
ALTER TABLE "OrganizationMembers" ALTER COLUMN "role" SET DEFAULT 'MEMBER';
COMMIT;

-- AlterTable
ALTER TABLE "OrganizationMembers" ALTER COLUMN "role" SET DEFAULT 'MEMBER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "Role" "Role" NOT NULL DEFAULT 'USER';
