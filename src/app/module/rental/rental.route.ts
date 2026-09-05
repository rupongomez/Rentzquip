import { Router } from "express";
import { RentalController } from "./rental.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { rentalValidationZodSchema } from "./rental.validation";

const router = Router();

router.post("/create", auth(Role.CUSTOMER), RentalController.createRental);
router.patch(
  "/approve/:rentalId",
  validateRequest(rentalValidationZodSchema),
  auth(Role.PROVIDER),
  RentalController.approveRental,
);

export const RentalRoutes = router;
