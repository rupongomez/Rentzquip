import { NextFunction, Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { PaymentService } from "./payments.service";
import { sendResponse } from "../../utils/sendResponse";
import httpStatus from "http-status";

const createCheckoutSession = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const rentalId = req.body.rentalId;
    const user = req.user!;

    const equipment = await PaymentService.createPaymentSessionIntoDB(
      rentalId,
      user,
    );
    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Checkout session created successfully",
      data: {
        equipment,
      },
    });
  },
);

export const PaymentController = {
  createCheckoutSession,
};
