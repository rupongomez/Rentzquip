import { Router } from "express";
import { RentalController } from "./rental.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { validateRequest } from "../../middleware/validateRequest";
import { rentalValidationZodSchema } from "./rental.validation";

const router = Router();

router.post("/create", auth(Role.CUSTOMER), RentalController.createRental);
router.get(
  "/rental-history/all",
  auth(Role.CUSTOMER),
  RentalController.getAllRentalsForUser,
);
router.patch(
  "/update-status/:rentalId",
  validateRequest(rentalValidationZodSchema),
  auth(Role.PROVIDER),
  RentalController.approveRental,
);

router.get(
  "/provider-rentals/all",
  auth(Role.PROVIDER),
  RentalController.getAllRentalsForProvider,
);

router.get(
  "/admin-rentals/all",
  auth(Role.ADMIN, Role.MODERATOR),
  RentalController.getAllRentalsForAdmin,
);

export const RentalRoutes = router;
