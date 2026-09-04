import { Router } from "express";

import { validateRequest } from "../../middleware/validateRequest";

import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { EquipmentController } from "./equipment.controller";
import { CreateEquipmentZodSchema } from "./equipment.validation";
import { upload } from "../../lib/multer";

const router = Router();

router.post(
  "/create",
  auth(Role.PROVIDER),
  upload.fields([{ name: "images", maxCount: 5 }]),

  EquipmentController.createEquipment,
);

export const EquipmentRoute = router;
