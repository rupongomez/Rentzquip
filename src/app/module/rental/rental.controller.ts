import { NextFunction, Request, Response } from "express";
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

export const RentalController = {
  createRental,
};
