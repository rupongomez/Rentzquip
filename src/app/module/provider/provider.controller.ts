import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { ProviderPayload } from "./provider.interface";
import { ProviderService } from "./provider.service";
import { RequestUser } from "../../middleware/checkAuth";
import httpStatus from "http-status";

const applyToBeProvider = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user as RequestUser;
    const providerData = req.body;

    const newProvider = await ProviderService.applyToBeProvider(
      user,
      providerData,
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

export const ProviderController = {
  applyToBeProvider,
  getProviderByUserId,
};
