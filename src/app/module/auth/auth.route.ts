import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import { RegisterUserValidationZodSchema } from "./auth.validation";

const router = Router();

router.post(
  "/register",
  validateRequest(RegisterUserValidationZodSchema),
  AuthController.registerUser,
);

router.post("/verify-otp", AuthController.verifyUserOtp);

router.post("/resend-otp", AuthController.resendOtp);
router.post("/login", AuthController.loginUser);
router.get(
  "/me",
  auth(Role.PROVIDER, Role.CUSTOMER, Role.ADMIN, Role.MODERATOR),
  AuthController.getMe,
);
router.post("/refresh-token", AuthController.refreshToken);
export const AuthRoutes = router;
