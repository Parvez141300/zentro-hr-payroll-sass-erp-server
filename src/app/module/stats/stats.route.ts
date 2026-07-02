import { Router } from "express";
import { statsController } from "./statscontroller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/dashboard/stats",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE, Role.ACCOUNTANT),
    statsController.getDashboardStats
);

router.get(
    "/department/stats",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD),
    statsController.getDepartmentStats
);

router.get(
    "/attendance/stats",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE),
    statsController.getAttendanceStats
);

router.get("/leave/stats",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE),
    statsController.getLeaveStats
);

router.get("/payroll/stats",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE, Role.ACCOUNTANT),
    statsController.getPayrollStats
);

export const statsRoute = router;