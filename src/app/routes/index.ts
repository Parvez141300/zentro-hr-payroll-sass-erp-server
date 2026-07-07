import { Router } from "express";
import { companyRoute } from "../module/company/company.route";
import { subscriptionPlanConfigRoute } from "../module/subscriptionPlanConfig/subscriptionPlanConfig.route";
import { authRoute } from "../module/auth/auth.route";
import { departmentRoute } from "../module/department/department.route";
import { designationRoute } from "../module/designation/designation.route";
import { userRoute } from "../module/user/user.route";
import { employeeRoute } from "../module/employee/employee.route";
import { hrManagerRoute } from "../module/hrManager/hrManager.route";
import { accountantRoute } from "../module/accountant/accountant.route";
import { departmentHeadRoute } from "../module/departmentHead/departmentHead.route";
import { adminRoute } from "../module/admin/admin.route";
import { attendanceRoute } from "../module/attendance/attendance.route";
import { leaveTypeRoute } from "../module/leaveType/leaveType.route";
import { leaveRoute } from "../module/leave/leave.route";
import { payrollRoute } from "../module/payroll/payroll.route";
import { stripeRoute } from "../module/stripe/stripe.route";
import { sslCommerzRoute } from "../module/sslCommerz/sslCommerz.route";
import { paymentRoute } from "../module/payment/payment.route";

const router = Router();

router.use("/auth", authRoute)
router.use("/companies", companyRoute);
router.use("/subscription-plans-config", subscriptionPlanConfigRoute);
router.use("/departments", departmentRoute);
router.use("/designations", designationRoute);
router.use("/users", userRoute);
router.use("/employees", employeeRoute);
router.use("/hr-managers", hrManagerRoute);
router.use("/accountants", accountantRoute);
router.use("/department-heads", departmentHeadRoute);
router.use("/admins", adminRoute);
router.use("/attendances", attendanceRoute);
router.use("/leave-types", leaveTypeRoute);
router.use("/leaves", leaveRoute);
router.use("/payrolls", payrollRoute);
router.use("/stripe", stripeRoute);
router.use("/sslcommerz", sslCommerzRoute);
router.use("/payments", paymentRoute);

export const indexRoute = router;