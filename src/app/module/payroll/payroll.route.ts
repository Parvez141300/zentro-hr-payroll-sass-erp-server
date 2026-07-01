import { Router } from "express";
import { payrollController } from "./payroll.controller";

const router = Router();

router.post("/", payrollController.generatePayroll);
router.get("/", payrollController.getAllOrQueryPayrolls);
router.patch("/:id", payrollController.updatePayrollInDB);
router.get("/:id/payslip", payrollController.getPayslipData);

export const payrollRoute = router;