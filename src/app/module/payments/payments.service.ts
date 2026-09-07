import Stripe from "stripe";
import config from "../../config";
import { prisma } from "../../lib/prisma";
import { stripe } from "../../lib/stripe";
import { RequestUser } from "../../middleware/checkAuth";
import { AppError } from "../../utils/AppError";
import httpStatus from "http-status";
import { handleCheckOutCompleted } from "./payment.utils";

const createPaymentSessionIntoDB = async (
  rentalId: string,
  user: RequestUser,
) => {
  const transaction = await prisma.$transaction(async (tx) => {
    const findUser = await tx.user.findUnique({
      where: {
        id: user.userId,
      },
    });

    if (!findUser) {
      throw new AppError(httpStatus.NOT_FOUND, "User not found");
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

    const findRental = await tx.rental.findUnique({
      where: {
        id: rentalId,
      },
    });

    if (!findRental) {
      throw new AppError(httpStatus.NOT_FOUND, "Rental not found");
    }

    if (findRental.customerId !== user.userId) {
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
    const equipmentDetails = await tx.equipment.findUnique({
      where: {
        id: findRental.equipmentId,
      },
    });

    if (!equipmentDetails) {
      throw new AppError(httpStatus.NOT_FOUND, "Equipment not found");
    }

    const rentalAmount = findRental.rentalAmount.toNumber();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: "usd",
            product_data: {
              name: equipmentDetails.name,
            },
            unit_amount: rentalAmount * 100,
          },
        },
      ],

      customer: stripeCustomerId,
      success_url: `${config.frontend_url}/paid?success=true`,
      cancel_url: `${config.frontend_url}/paid?success=false`,
      metadata: { userId: findUser.id, rentalId: findRental.id },
    });
    return session.url;
  });

  return transaction;
};

const handleStripeWebhook = async (payload: Buffer, signature: string) => {
  const endpointSecret = config.stripe_webhook_secret;

  try {
    const event = stripe.webhooks.constructEvent(
      payload,
      signature,
      endpointSecret,
    );

    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckOutCompleted(
          event.data.object as Stripe.Checkout.Session,
        );
        break;

      // case "payment_intent.succeeded":
      //   await handleCheckOutCompleted(event.data.object as any);
      //   break;

      default:
        console.log(`Not matched event type ${event.type}`);
    }
  } catch (error: any) {
    console.log("Stripe webhook verify error:", error.message);
    throw error;
  }
};

export const PaymentService = {
  createPaymentSessionIntoDB,
  handleStripeWebhook,
};
