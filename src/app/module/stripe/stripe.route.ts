import { Router } from "express";
import { stripeController } from "./stripe.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/create-checkout-session",
    checkAuthMiddleware(Role.Super_ADMIN),
    stripeController.createStripeCheckoutSession
);


export const stripeRoute = router;