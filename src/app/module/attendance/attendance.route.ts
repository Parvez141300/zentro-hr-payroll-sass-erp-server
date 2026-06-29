import { Router } from "express";
import { attendanceController } from "./attendance.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE),
    attendanceController.getAllOrQueryAttendance
);
router.get(
    "/:id", 
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE), 
    attendanceController.getAttendanceById
);
router.post(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD),
    attendanceController.markAttendance
);
router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD),
    attendanceController.updateAttendance
);
// router.delete(
//     "/:id",
//     checkAuthMiddleware(Role.Super_ADMIN),
//     attendanceController.deleteAttendance
// );

export const attendanceRoute = router;