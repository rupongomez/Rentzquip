import { differenceInDays, isFuture, isPast, isSameDay } from "date-fns";
import { prisma } from "../../lib/prisma";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { EquipmentStatus, RentalStatus } from "../../../generated/prisma/enums";

const createRent = async (rentalData: IRentalPayload, user: RequestUser) => {
  const transaction = await prisma.$transaction(async (tx) => {
    const getEquipment = await tx.equipment.findFirst({
      where: {
        id: rentalData.equipmentId,
      },
    });

    if (!getEquipment) {
      throw new AppError(httpStatus.NOT_FOUND, "Equipment not found");
    }

    if (getEquipment.quantity < rentalData.quantity) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Requested quantity exceeds available equipment quantity",
      );
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

    const isRentSameDay = isSameDay(
      new Date(rentalData.startDate),
      new Date(rentalData.endDate),
    );

    if (isRentSameDay) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rental start date and end date cannot be the same",
      );
    }

    const isRentalDateValid = isFuture(new Date(rentalData.startDate));

    if (!isRentalDateValid) {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Rental start date must be a future date",
      );
    }

    const rentalDays = differenceInDays(
      new Date(rentalData.endDate),
      new Date(rentalData.startDate),
    );

    const createRental = await tx.rental.create({
      data: {
        equipmentId: rentalData.equipmentId,
        customerId: user.userId,
        startDate: new Date(rentalData.startDate),
        endDate: new Date(rentalData.endDate),
        rentalDays: rentalDays,
        quantity: rentalData.quantity,
        providerId: getEquipment.providerId,
        rentalAmount:
          Number(getEquipment.rentalPrice) * rentalData.quantity * rentalDays,
        securityDeposit:
          Number(getEquipment.securityDeposit) * rentalData.quantity,
      },
    });

    const updateEquipment = await tx.equipment.update({
      where: {
        id: rentalData.equipmentId,
      },
      data: {
        quantity: {
          decrement: rentalData.quantity,
        },
        status: EquipmentStatus.PENDING,
      },
    });

    return createRental;
  });

  return transaction;
};

const approveRent = async (
  rentalId: string,
  newRentalStatus: RentalStatus,
  user: RequestUser,
) => {
  const getProvider = await prisma.provider.findFirst({
    where: {
      userId: user.userId,
    },
  });
  const getRental = await prisma.rental.findFirst({
    where: {
      id: rentalId,
      providerId: getProvider?.id,
    },
  });

  if (!getRental) {
    throw new AppError(httpStatus.NOT_FOUND, "Rental not found");
  }

  if (getRental.rentalStatus === RentalStatus.APPROVED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rental is already approved");
  }

  if (getRental.rentalStatus === RentalStatus.REJECTED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rental is already rejected");
  }

  if (getRental.rentalStatus === RentalStatus.CANCELLED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rental is already cancelled");
  }
  if (getRental.rentalStatus === RentalStatus.COMPLETED) {
    throw new AppError(httpStatus.BAD_REQUEST, "Rental is already completed");
  }
  if (
    getRental.rentalStatus === RentalStatus.LATE ||
    getRental.rentalStatus === RentalStatus.ONGOING ||
    getRental.rentalStatus === RentalStatus.PENDING
  ) {
    const updateRental = await prisma.rental.update({
      where: {
        id: rentalId,
      },
      data: {
        rentalStatus: newRentalStatus,
      },
    });
    return updateRental;
  }
};

export const RentalsService = {
  createRent,
  approveRent,
};
