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

export const ProviderRoute = router;
