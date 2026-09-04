import { Router } from "express";

import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { EquipmentController } from "./equipment.controller";
import { upload } from "../../lib/multer";

const router = Router();

router.post(
	"/create",
	auth(Role.PROVIDER),
	upload.fields([{ name: "images", maxCount: 5 }]),
	EquipmentController.createEquipment,
);

router.get("/all", EquipmentController.getAllEquipment);

router.get("/single/:equipmentId", EquipmentController.getSingleEquipment);

export const EquipmentRoute = router;
