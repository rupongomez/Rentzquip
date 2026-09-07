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

const handleWebhook = catchAsync(
  async (req: Request, res: Response, next: NextFunction) => {
    const event = req.body as Buffer;
    const signature = req.headers["stripe-signature"] as string;
    await PaymentService.handleStripeWebhook(event, signature as string);

    sendResponse(res, {
      statusCode: httpStatus.OK,
      success: true,
      message: "Webhook handled successfully",
      data: null,
    });
  },
);

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
};
