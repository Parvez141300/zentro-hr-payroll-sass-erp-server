import { Router } from "express";
import { statsController } from "./statscontroller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/dashboard/stats", checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE, Role.ACCOUNTANT), statsController.getDashboardStats)

export const statsRoute = router;