import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { RequestUser } from "../../middleware/checkAuth";

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

export const EquipmentController = {
  createEquipment,
};
