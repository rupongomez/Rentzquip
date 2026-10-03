import { prisma } from "../../lib/prisma";
import type { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import type { ProviderPayload } from "./provider.interface";
import { UploadApiResponse } from "cloudinary";
import { cloudinaryUpload } from "../../lib/cloudinary";
import { ProviderStatus } from "../../../generated/prisma/enums";

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

const getProvidersOwnProfile = async (user: RequestUser) => {
  const provider = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
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

const getAllProviders = async () => {
  const providers = await prisma.provider.findMany();
  return providers;
};

const getSingleProvidersById = async (providerId: string) => {
  const provider = await prisma.provider.findUnique({
    where: {
      id: providerId,
    },
  });

  if (!provider) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Provider not found for the given provider ID.",
    );
  }

  return provider;
};

const approveProvider = async (
  providerId: string,
  newStatus: ProviderStatus,
) => {
  const isProviderExist = await prisma.provider.findFirst({
    where: {
      id: providerId,
    },
  });

  if (!isProviderExist) {
    throw new AppError(
      httpStatus.NOT_FOUND,
      "Provider not found for the given user ID.",
    );
  }
  if (isProviderExist.status === "ACTIVE") {
    throw new AppError(httpStatus.BAD_REQUEST, "Provider is already approved.");
  }

  const updatedProvider = await prisma.provider.update({
    where: {
      id: isProviderExist.id,
    },
    data: {
      status: newStatus,
    },
  });

  return updatedProvider;
};

export const ProviderService = {
  applyToBeProvider,
  getSingleProvidersById,
  getAllProviders,
  approveProvider,
  getProvidersOwnProfile,
};
