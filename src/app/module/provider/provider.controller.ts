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

const getProvidersOwnProfile = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;
    const provider = await ProviderService.getProvidersOwnProfile(
      user as RequestUser,
    );
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
const getSingleProviderById = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const providerId = req.params.providerId;

    const provider = await ProviderService.getSingleProvidersById(
      providerId as string,
    );
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
    const query = req.query;
    const providers = await ProviderService.getAllProviders(query);
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
    const providerId = req.params.providerId;
    const newStatus = req.body.status;
    const updatedProvider = await ProviderService.approveProvider(
      providerId as string,
      newStatus,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Provider Status updated successfully",
      data: {
        provider: updatedProvider,
      },
    });
  },
);

export const ProviderController = {
  applyToBeProvider,
  getProvidersOwnProfile,
  getAllProviders,
  approveProvider,
  getSingleProviderById,
};
