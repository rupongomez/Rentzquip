import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const createBooking = async (equipmentId: string, user: RequestUser) => {
  const getEquipment = await prisma.equipment.findFirst({
    where: {
      id: equipmentId,
    },
  });

  if (!getEquipment) {
    throw new AppError(httpStatus.NOT_FOUND, "Equipment not found");
  }

  if (getEquipment.quantity <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Equipment is not available at this time",
    );
  }

  if (
    getEquipment.status === "RENTED" ||
    getEquipment.status === "MAINTENANCE"
  ) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Equipment is not available at this time",
    );
  }

  //   TODO:Create booking with payment.prisma
};

export const BookingsService = {
  createBooking,
};
