import { Router } from "express";
import { companyRoute } from "../module/company/company.route";
import { subscriptionPlanConfigRoute } from "../module/subscriptionPlanConfig/subscriptionPlanConfig.route";

const router = Router();

router.use("/companies", companyRoute);
router.use("/subscription-plans-config", subscriptionPlanConfigRoute);

export const indexRoute = router;