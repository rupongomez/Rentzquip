import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProviderService } from "./provider.service";
import type { RequestUser } from "../../middleware/checkAuth";
import httpStatus from "http-status";
import { ApplyProviderZodSchema } from "./provider.validation";
import { AppError } from "../../utils/AppError";

const applyToBeProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const file = req.files as { [fieldname: string]: Express.Multer.File[] };
    const imageFile = file?.["image"] ? file["image"][0] : null;

    const user = req.user as RequestUser;

    const providerData = ApplyProviderZodSchema.safeParse(
      JSON.parse(req.body.data),
    );
    console.log(providerData);
    //  req.body.data ? JSON.parse(req.body.data) : req.body;
    if (!providerData.success) {
      throw new AppError(httpStatus.BAD_REQUEST, "Invalid provider data");
    }
    const validData = providerData.data;
    const newProvider = await ProviderService.applyToBeProvider(
      user,
      validData,
      imageFile,
    );

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Provider applied successfully",
      data: {
        provider: newProvider,
      },
    });
  },
);

const getProviderByUserId = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as RequestUser;
    const provider = await ProviderService.getProviderByUserId(user.userId);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Provider found successfully",
      data: {
        provider,
      },
    });
  },
);

const getAllProviders = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providers = await ProviderService.getAllProviders();
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Providers retrieved successfully",
      data: {
        providers,
      },
    });
  },
);

const approveProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.userId;
    const updatedProvider = await ProviderService.approveProvider(
      userId as string,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Provider approved successfully",
      data: {
        provider: updatedProvider,
      },
    });
  },
);

export const ProviderController = {
  applyToBeProvider,
  getProviderByUserId,
  getAllProviders,
  approveProvider,
};
