import { Router } from "express";
import { leaveController } from "./leave.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { multerUploadService } from "../../config/cloudinary.utils";
import { updateProfileMiddlewareSecond } from "../../middleware/updateProfileMiddlewareSecond";

const router = Router();

router.post(
    "/",
    checkAuthMiddleware(Role.EMPLOYEE),
    multerUploadService.single("file"),
    updateProfileMiddlewareSecond,
    leaveController.applyForLeave
);
router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE),
    leaveController.getAllOrQueryLeaves
);
// for body use form data
router.patch(
    "/employee/:id",
    checkAuthMiddleware(Role.EMPLOYEE),
    multerUploadService.single("file"),
    updateProfileMiddlewareSecond,
    leaveController.employeeLeaveUpdate
);
// for body use form data
router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD),
    leaveController.updateLeave
);
router.delete(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    leaveController.deleteLeave
);

export const leaveRoute = router;