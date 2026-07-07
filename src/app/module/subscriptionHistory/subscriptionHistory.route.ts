import { Router } from "express";
import { subscriptionHistoryController } from "./subscriptionHistory.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN),
    subscriptionHistoryController.getCompanySubscriptionHistory
);

export const subscriptionHistoryRoute = router;