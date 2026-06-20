import { Router } from "express";
import { subscriptionPlanConfigController } from "./subscriptionPlanConfig.controller";

const router = Router();

router.post("/", subscriptionPlanConfigController.createSubscriptionPlanConfig)

export const subscriptionPlanConfigRoute = router;