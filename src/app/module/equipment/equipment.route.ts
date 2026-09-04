import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest";

import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { EquipmentController } from "./equipment.controller";
import { CreateEquipmentZodSchema } from "./equipment.validation";

const router = Router();

router.post(
  "/create",
  auth(Role.PROVIDER),
  //   validateRequest(CreateEquipmentZodSchema),
  EquipmentController.createEquipment,
);

export const EquipmentRoute = router;
