import { Router } from "express";
import { RentalController } from "./rental.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create", auth(Role.CUSTOMER), RentalController.createRental);

export const RentalRoutes = router;
