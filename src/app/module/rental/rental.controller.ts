import type { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { RentalsService } from "./rental.service";
import httpStatus from "http-status";

const createRental = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentPayload = req.body;
    const user = req.user!;

    const equipment = await RentalsService.createRent(rentPayload, user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Rental request submitted successfully",
      data: {
        equipment,
      },
    });
  },
);

const approveRental = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const { rentalId } = req.params;
    const { rentalStatus } = req.body;
    const user = req.user!;

    const updatedRental = await RentalsService.approveRent(
      rentalId as string,
      rentalStatus,
      user,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Rental request approved successfully",
      data: {
        updatedRental,
      },
    });
  },
);

const getAllRentalsForUser = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user!;
    const rentals = await RentalsService.getAllRentalsForUser(user);
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "All rentals retrieved successfully",
      data: rentals,
    });
  },
);

export const RentalController = {
  createRental,
  approveRental,
  getAllRentalsForUser,
};
