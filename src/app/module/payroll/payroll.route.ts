import { Router } from "express";
import { payrollController } from "./payroll.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.ACCOUNTANT),
    payrollController.generatePayroll
);
router.get("/", payrollController.getAllOrQueryPayrolls);
router.patch("/:id", payrollController.updatePayrollInDB);
router.get("/:id/payslip", payrollController.getPayslipData);

export const payrollRoute = router;