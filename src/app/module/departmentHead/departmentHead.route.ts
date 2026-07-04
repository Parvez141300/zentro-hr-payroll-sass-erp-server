import { Router } from "express";
import { departmentHeadController } from "./departmentHead.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { multerUploadService } from "../../config/cloudinary.utils";
import { updateProfileMiddlewareSecond } from "../../middleware/updateProfileMiddlewareSecond";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN),
    departmentHeadController.getAllOrQueryDepartmentHeads
);
router.get(
    "/own-profile",
    checkAuthMiddleware(Role.DEPARTMENT_HEAD),
    departmentHeadController.getDepartmentHeadOwnProfile
);
router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.DEPARTMENT_HEAD),
    multerUploadService.single("file"),
    updateProfileMiddlewareSecond,
    departmentHeadController.updateCompanyDepartmentHead
);
router.delete(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN),
    departmentHeadController.deleteCompanyDepartmentHead
);

export const departmentHeadRoute = router;