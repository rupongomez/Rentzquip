import { Router } from "express";
import { Role } from "../../../generated/prisma/enums";
import { auth } from "../../middleware/checkAuth";
import { AuthController } from "./auth.controller";
import { validateRequest } from "../../middleware/validateRequest";
import {
	LoginUserValidationZodSchema,
	RegisterUserValidationZodSchema,
	resendOtpValidationZodSchema,
	VerifyOtpValidationZodSchema,
} from "./auth.validation";

const router = Router();

router.post(
	"/register",
	validateRequest(RegisterUserValidationZodSchema),
	AuthController.registerUser,
);

router.post(
	"/verify-otp",
	validateRequest(VerifyOtpValidationZodSchema),
	AuthController.verifyUserOtp,
);

router.post(
	"/resend-otp",
	validateRequest(resendOtpValidationZodSchema),
	AuthController.resendOtp,
);
router.post(
	"/login",
	validateRequest(LoginUserValidationZodSchema),
	AuthController.loginUser,
);
router.post("/login-with-google", AuthController.loginWithGoogle);
router.post("/forgot-password", AuthController.forgetPassword);
router.post("/reset-password", AuthController.resetPassword);
router.get(
	"/me",
	auth(Role.PROVIDER, Role.CUSTOMER, Role.ADMIN, Role.MODERATOR),
	AuthController.getMe,
);
router.post(
	"/refresh-token",

	AuthController.refreshToken,
);
export const AuthRoutes = router;
