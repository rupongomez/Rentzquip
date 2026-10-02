import { Router } from "express";
import { ProviderController } from "./provider.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { ApplyProviderZodSchema } from "./provider.validation";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";
import { upload } from "../../lib/multer";

const router = Router();

router.post(
  "/apply",
  upload.fields([{ name: "image", maxCount: 1 }]),
  //   validateRequest(ApplyProviderZodSchema),
  auth(Role.CUSTOMER),
  ProviderController.applyToBeProvider,
);

router.get(
  "/me",
  auth(Role.PROVIDER, Role.CUSTOMER),
  ProviderController.getProviderByUserId,
);

export const ProviderRoute = router;
