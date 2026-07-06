import { Router } from "express";
import { stripeController } from "./stripe.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import express from "express";

const router = Router();

router.post("/create-checkout-session", checkAuthMiddleware(Role.Super_ADMIN), stripeController.createStripeCheckoutSession);
router.post("/webhook", express.raw({ type: 'application/json' }), stripeController.handleStripeWebhook);

export const stripeRoute = router;