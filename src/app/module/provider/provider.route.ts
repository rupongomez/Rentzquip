import { Router } from "express";
import { ProviderController } from "./provider.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { ApplyProviderZodSchema } from "./provider.validation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
	"/apply",
	validateRequest(ApplyProviderZodSchema),
	auth(Role.CUSTOMER),
	ProviderController.applyToBeProvider,
);

router.get("/me", auth(Role.PROVIDER), ProviderController.getProviderByUserId);

export const ProviderRoute = router;
