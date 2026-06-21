import { Router } from "express";
import { subscriptionPlanConfigController } from "./subscriptionPlanConfig.controller";

const router = Router();

router.get("/", subscriptionPlanConfigController.getAllSubscriptionPlanConfig);
router.post("/", subscriptionPlanConfigController.createSubscriptionPlanConfig);
router.patch("/:id", subscriptionPlanConfigController.updateSubscriptionPlanConfig);

export const subscriptionPlanConfigRoute = router;