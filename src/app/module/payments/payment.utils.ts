import Stripe from "stripe";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { prisma } from "../../lib/prisma";
import { PaymentStatus, Prisma } from "../../../generated/prisma/client";

export const handleCheckOutCompleted = async (
  session: Stripe.Checkout.Session,
) => {
  const userId = session.metadata?.userId;
  const stripeCustomerId = session.customer as string;
  const transactionId = session.payment_intent as string;
  const rentalId = session.metadata?.rentalId;
  if (!userId || !stripeCustomerId || !transactionId || !rentalId) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing required information in the session metadata",
    );
  }

  const amountInCents = session.amount_total!;
  const amount = new Prisma.Decimal(amountInCents / 100);

  if (!amountInCents) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "Missing required information in the session amount total",
    );
  }

  await prisma.payment.upsert({
    where: {
      rentalId: rentalId,
    },
    create: {
      customerId: stripeCustomerId,
      rentalId: rentalId,
      transactionId: transactionId,
      amount,
      stripeCustomerId,
      status: "COMPLETED",
    },
    update: {
      stripeCustomerId,
      status: PaymentStatus.COMPLETED,
      amount,
      transactionId,
    },
  });
};
