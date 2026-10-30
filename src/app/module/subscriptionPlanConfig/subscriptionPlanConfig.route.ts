import { Router } from "express";
import { subscriptionPlanConfigController } from "./subscriptionPlanConfig.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/",
    subscriptionPlanConfigController.getAllSubscriptionPlanConfig
);
router.post(
    "/",
    checkAuthMiddleware(Role.PLATFORM_SUPER_ADMIN),
    subscriptionPlanConfigController.createSubscriptionPlanConfig
);
router.patch(
    "/:id",
    checkAuthMiddleware(Role.PLATFORM_SUPER_ADMIN),
    subscriptionPlanConfigController.updateSubscriptionPlanConfig
);
router.delete(
    "/:id",
    checkAuthMiddleware(Role.PLATFORM_SUPER_ADMIN),
    subscriptionPlanConfigController.deleteSubscriptionPlanConfig
);

export const subscriptionPlanConfigRoute = router;