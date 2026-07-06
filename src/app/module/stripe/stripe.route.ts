import { Router } from "express";
import { stripeController } from "./stripe.controller";

const router = Router();

router.post("/webhook", stripeController.handleStripeWebhook);

export const stripeRoute = router;