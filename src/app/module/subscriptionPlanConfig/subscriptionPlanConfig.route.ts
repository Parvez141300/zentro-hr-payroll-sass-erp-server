import { Router } from "express";
import { subscriptionPlanConfigController } from "./subscriptionPlanConfig.controller";

const router = Router();

router.post("/", subscriptionPlanConfigController.createSubscriptionPlanConfig);
router.patch("/:id", subscriptionPlanConfigController.updateSubscriptionPlanConfig);

export const subscriptionPlanConfigRoute = router;