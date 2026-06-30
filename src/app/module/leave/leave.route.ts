import { Router } from "express";
import { leaveController } from "./leave.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/",
    checkAuthMiddleware(Role.EMPLOYEE),
    leaveController.applyForLeave
);
router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE),
    leaveController.getAllOrQueryLeaves
);
router.patch(
    "/employee/:id",
    checkAuthMiddleware(Role.EMPLOYEE),
    leaveController.employeeLeaveUpdate
);
router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD),
    leaveController.updateLeave
);

export const leaveRoute = router;