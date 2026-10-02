import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import type { ProviderPayload } from "./provider.interface";
import { UploadApiResponse } from "cloudinary";
import { cloudinaryUpload } from "../../lib/cloudinary";

const applyToBeProvider = async (
  user: RequestUser,
  providerData: ProviderPayload,
  imageFile: Express.Multer.File | null,
) => {
  const { address, description, phoneNumber } = providerData;
  if (!user) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "User ID is required to apply as a provider.",
    );
  }

  const providers = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
    },
  });

  const isUserEmailVerified = await prisma.user.findUnique({
    where: { id: user.userId },
  });

  if (isUserEmailVerified?.emailVerified === false) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "You need to verify your email before applying to be a provider.",
    );
  }

  if (providers) {
    throw new AppError(
      httpStatus.CONFLICT,
      "You have already applied to be a provider.",
    );
  }

  const imageUploadResult = await new Promise<UploadApiResponse>(
    (resolve, reject) => {
      cloudinaryUpload.uploader
        .upload_stream(
          {
            resource_type: "image",
          },
          async (error, result) => {
            if (error) {
              return reject(error);
            }
            if (!result) {
              return reject(
                new AppError(httpStatus.BAD_REQUEST, "Image upload failed"),
              );
            }
            resolve(result);
          },
        )
        .end(imageFile?.buffer);
    },
  );

  const newProvider = await prisma.provider.create({
    data: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      address,
      description,
      imageUrl: imageUploadResult.secure_url,
      imagePublicId: imageUploadResult.public_id,
      phoneNumber,
    },
  });

  return newProvider;
};

const getProviderByUserId = async (userId: string) => {
  const provider = await prisma.provider.findFirst({
    where: {
      userId,
    },
  });

  if (!provider) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Provider not found for the given user ID.",
    );
  }

  return provider;
};

export const ProviderService = {
  applyToBeProvider,
  getProviderByUserId,
};
