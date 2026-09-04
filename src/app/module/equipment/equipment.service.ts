import { UploadApiResponse } from "cloudinary";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import { IEquipmentPayload } from "./equipment.interface";
import httpStatus from "http-status";
import { cloudinaryUpload } from "../../lib/cloudinary";

const createEquipment = async (
  equipmentData: IEquipmentPayload,
  images: Express.Multer.File[],
  user: RequestUser,
) => {
  const {
    name,
    categoryId,
    brand,
    description,
    model,
    quantity,
    rentalPrice,
    securityDeposit,
  } = equipmentData;

  const getUser = await prisma.user.findFirst({
    where: {
      id: user.userId,
    },
  });

  if (!getUser) {
    throw new AppError(httpStatus.NOT_FOUND, "User not found");
  }

  const isProviderExist = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
    },
  });

  if (!isProviderExist) {
    throw new AppError(httpStatus.NOT_FOUND, "Provider not found");
  }

  const imageUploadResult = await Promise.all(
    images.map((img) => {
      return new Promise<UploadApiResponse>((resolve, reject) => {
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
          .end(img?.buffer);
      });
    }),
  );

  const newEquipment = await prisma.equipment.create({
    data: {
      name,
      categoryId,
      brand,
      description,
      model,
      quantity,
      rentalPrice,
      securityDeposit,
      imagePublicId: imageUploadResult.map((img) => ({
        url: img.secure_url,
        publicId: img.public_id,
      })),
      providerId: isProviderExist.id,
    },
    include: {
      provider: true,
    },
  });

  return newEquipment;
};

export const EquipmentService = {
  createEquipment,
};
