import { Router } from "express";
import { PaymentController } from "./payments.controller";
import { auth } from "../../middleware/checkAuth";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
  "/create-checkout-session",
  auth(Role.CUSTOMER),
  PaymentController.createCheckoutSession,
);

export const paymentRouter = router;
