import { Router } from "express";
import { companyRoute } from "../module/company/company.route";
import { subscriptionPlanConfigRoute } from "../module/subscriptionPlanConfig/subscriptionPlanConfig.route";
import { authRoute } from "../module/auth/auth.route";
import { departmentRoute } from "../module/department/department.route";

const router = Router();

router.use("/auth", authRoute)
router.use("/companies", companyRoute);
router.use("/subscription-plans-config", subscriptionPlanConfigRoute);
router.use("/departments", departmentRoute);

export const indexRoute = router;