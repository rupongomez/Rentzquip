import z from "zod";
import { RentalStatus } from "../../../generated/prisma/enums";

export const rentalValidationZodSchema = z.object({
  rentalStatus: z.enum(
    [
      RentalStatus.APPROVED,
      RentalStatus.REJECTED,
      RentalStatus.CANCELLED,
      RentalStatus.COMPLETED,
      RentalStatus.LATE,
      RentalStatus.ONGOING,
      RentalStatus.PENDING,
    ],
    { error: "Invalid rental status" },
  ),
});
