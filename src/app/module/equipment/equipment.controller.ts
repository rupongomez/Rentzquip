import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { RequestUser } from "../../middleware/checkAuth";

import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";
import { EquipmentService } from "./equipment.service";

const createEquipment = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.user as RequestUser;

    const images = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageFiles = images?.["images"] || [];

    const category = await EquipmentService.createEquipment(
      payload,
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
