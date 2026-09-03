import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { ProviderPayload } from "./provider.interface";

const applyToBeProvider = async (
  user: RequestUser,
  providerData: ProviderPayload,
) => {
  const { address, description, imageUrl, phoneNumber } = providerData;
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

  const newProvider = await prisma.provider.create({
    data: {
      userId: user.userId,
      name: user.name,
      email: user.email,
      address,
      description,
      imageUrl,
      phoneNumber,
    },
  });

  return newProvider;
};

export const ProviderService = {
  applyToBeProvider,
};
