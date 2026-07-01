import { Router } from "express";
import { payrollController } from "./payroll.controller";

const router = Router();

router.post("/", payrollController.generatePayroll);

export const payrollRoute = router;