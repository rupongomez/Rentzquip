import type { Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import type { IRequestUser } from "./auth.interface";
import { AuthService } from "./auth.service";

const registerUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	await AuthService.registerUser(payload);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message:
			"Your account has been created successfully. Please check your email for the OTP to verify your account.",
		data: {},
	});
});

const verifyUserOtp = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthService.verifyUserOtp(payload.email, payload.otp);
	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "OTP verified successfully",
		data: {
			accessToken,
			refreshToken,
		},
	});
});

const resendOtp = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	await AuthService.resendOtp(payload.email);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message:
			"A new OTP has been sent to your email. Please check your email to verify your account.",
		data: {},
	});
});
const forgetPassword = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	await AuthService.forgotPassword(payload.email);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message:
			"A forgot password OTP has been sent to your email. Please check your email to verify your account.",
		data: {},
	});
});
const resetPassword = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	await AuthService.resetPassword(payload.email, payload.otp, payload.password);

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message:
			"Your password has been reset successfully. You can now log in with your new password.",
		data: {},
	});
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const result = await AuthService.loginUser(payload);
	const { accessToken, refreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged in successfully",
		data: {
			accessToken,
			refreshToken,
		},
	});
});

const getMe = catchAsync(async (req: Request, res: Response) => {
	const user = req.user as unknown as IRequestUser;

	if (!user) {
		throw new Error("User information is missing in the request");
	}

	const result = await AuthService.getMe(user);
	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User profile fetched successfully",
		data: result,
	});
});

const loginWithGoogle = catchAsync(async (req: Request, res: Response) => {
	const payload = req.body;
	const { accessToken, refreshToken } =
		await AuthService.loginWithGoogle(payload);

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days
	});

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "You have successfully logged in with Google.",
		data: { accessToken, refreshToken },
	});
});

const refreshToken = catchAsync(async (req: Request, res: Response) => {
	console.log(req.cookies);
	if (!req.cookies.refreshToken) {
		throw new Error("Refresh token is missing");
	}
	const result = await AuthService.refreshToken(req.cookies.refreshToken);
	const { accessToken, refreshToken: newRefreshToken } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});
	res.cookie("refreshToken", newRefreshToken, {
		httpOnly: true,
		secure: false,
		sameSite: "none",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "New tokens generated successfully",
		data: {
			accessToken,
			refreshToken: newRefreshToken,
		},
	});
});

export const AuthController = {
	registerUser,
	verifyUserOtp,
	resendOtp,
	loginUser,
	forgetPassword,
	resetPassword,
	loginWithGoogle,
	getMe,
	refreshToken,
};
