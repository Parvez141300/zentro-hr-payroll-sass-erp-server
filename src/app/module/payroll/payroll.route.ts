import { Router } from "express";
import { payrollController } from "./payroll.controller";

const router = Router();

router.post("/", payrollController.generatePayroll);
router.get("/", payrollController.getAllOrQueryPayrolls);

export const payrollRoute = router;