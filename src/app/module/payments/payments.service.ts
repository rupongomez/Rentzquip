import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";

const createPaymentSessionIntoDB = async (
  paymentPayload: any,
  user: RequestUser,
) => {
  const { rentalId } = paymentPayload;

  const transaction = await prisma.$transaction(async (tx) => {
    const findUser = await tx.user.findUnique({
      where: {
        id: user.userId,
      },
    });

    if (!findUser) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
    }

    const findRental = await tx.rental.findUnique({
      where: {
        id: rentalId,
      },
    });

    if (!findRental) {
      throw new AppError(httpStatus.NOT_FOUND, "Rental not found");
    }

    if (findRental.id !== user.userId) {
      throw new AppError(
        httpStatus.UNAUTHORIZED,
        "You are not authorized to make payment for this rental",
      );
    }

    if (findRental.rentalStatus !== "APPROVED") {
      throw new AppError(
        httpStatus.BAD_REQUEST,
        "Only approved rentals can be paid for",
      );
    }

    let stripeCustomerId = findUser.stripeCustomerId;

    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: findUser.email,
        name: findUser.name,
        metadata: { userId: findUser.id },
      });
      stripeCustomerId = customer.id;
    }

    // TODO:line 33 assignment 4
  });

  return transaction;
};

export const PaymentService = {
  createPaymentSessionIntoDB,
};
