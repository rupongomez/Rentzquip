import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import type { RequestUser } from "../../middleware/checkAuth";

import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EquipmentService } from "./equipment.service";
import { validateRequest } from "../../middleware/validateRequest";
import { CreateEquipmentZodSchema } from "./equipment.validation";
import { AppError } from "../../utils/AppError";

const createEquipment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const payload = JSON.parse(req.body.data);
		const user = req.user as RequestUser;
		// console.log(payload, "from controller");
		const images = req.files as { [fieldname: string]: Express.Multer.File[] };
		const imageFiles = images?.["images"] || [];

		const zodValidationResult = CreateEquipmentZodSchema.safeParse(payload);
		if (!zodValidationResult.success) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				"Invalid request payload" + zodValidationResult.error.format(),
			);
		}
		const category = await EquipmentService.createEquipment(
			zodValidationResult.data,
			imageFiles,
			user,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Category created successfully",
			data: {
				category,
			},
		});
	},
);

const getAllEquipment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const query = req.query;
		const allEquipment = await EquipmentService.getAllEquipment(query);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "All equipment retrieved successfully",
			data: {
				allEquipment,
			},
		});
	},
);

const getSingleEquipment = catchAsync(
	async (req: Request, res: Response, next: NextFunction) => {
		const { equipmentId } = req.params;
		const equipment = await EquipmentService.getSingleEquipment(
			equipmentId as string,
		);
		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Equipment retrieved successfully",
			data: {
				equipment,
			},
		});
	},
);

export const EquipmentController = {
	createEquipment,
	getAllEquipment,
	getSingleEquipment,
};
