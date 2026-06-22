import { Router } from "express";
import { departmentController } from "./department.controller";

const router = Router();

router.post("/", departmentController.createDepartment);

export const departmentRoute = router;