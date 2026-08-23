import { Router } from "express";
import { leaveTypeController } from "./leaveType.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    leaveTypeController.getAllOrQueryLeaveTypes
);
router.post(
    "/", 
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER), 
    leaveTypeController.createLeaveType
);
router.patch(
    "/:id", 
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    leaveTypeController.updateLeaveType
);
router.delete(
    "/:id", 
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    leaveTypeController.deleteLeaveType
);

export const leaveTypeRoute = router;