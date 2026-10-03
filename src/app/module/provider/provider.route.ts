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
  ProviderController.getProvidersOwnProfile,
);
router.get(
  "/single/:providerId",
  auth(Role.PROVIDER, Role.CUSTOMER),
  ProviderController.getSingleProviderById,
);

router.get(
  "/all",
  auth(Role.ADMIN, Role.MODERATOR),
  ProviderController.getAllProviders,
);

router.patch(
  "/status/:providerId",
  auth(Role.ADMIN, Role.MODERATOR),
  ProviderController.approveProvider,
);

export const ProviderRoute = router;
