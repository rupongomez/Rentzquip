-- CreateEnum
CREATE TYPE "RentalStatus" AS ENUM ('PENDING', 'ONGOING', 'COMPLETED', 'CANCELLED', 'LATE');

-- AlterTable
ALTER TABLE "rentals" ADD COLUMN     "rentalStatus" "RentalStatus" NOT NULL DEFAULT 'PENDING';
