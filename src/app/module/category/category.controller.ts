import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { RequestUser } from "../../middleware/checkAuth";
import { CategoryService } from "./category.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCategory = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const payload = req.body;
    const user = req.user as RequestUser;
    const category = await CategoryService.createCategory(payload, user);
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

const getCategories = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const categories = await CategoryService.getCategories();

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Categories fetched successfully",
      data: {
        categories,
      },
    });
  },
);

export const CategoryController = {
  createCategory,
  getCategories,
};
