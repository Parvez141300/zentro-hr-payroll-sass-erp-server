import { Router } from "express";
import { companyRoute } from "../module/company/company.route";
import { subscriptionPlanConfigRoute } from "../module/subscriptionPlanConfig/subscriptionPlanConfig.route";
import { authRoute } from "../module/auth/auth.route";
import { departmentRoute } from "../module/department/department.route";
import { designationRoute } from "../module/designation/designation.route";
import { userRoute } from "../module/user/user.route";
import { employeeRoute } from "../module/employee/employee.route";
import { hrManagerRoute } from "../module/hrManager/hrManager.route";

const router = Router();

router.use("/auth", authRoute)
router.use("/companies", companyRoute);
router.use("/subscription-plans-config", subscriptionPlanConfigRoute);
router.use("/departments", departmentRoute);
router.use("/designations", designationRoute);
router.use("/users", userRoute);
router.use("/employees", employeeRoute);
router.use("/hr-managers", hrManagerRoute);

export const indexRoute = router;