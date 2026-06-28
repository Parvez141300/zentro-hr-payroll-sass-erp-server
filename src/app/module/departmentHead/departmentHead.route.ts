import { Router } from "express";
import { departmentHeadController } from "./departmentHead.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.patch(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.DEPARTMENT_HEAD),
    departmentHeadController.updateCompanyDepartmentHead
);
router.delete(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN),
    departmentHeadController.deleteCompanyDepartmentHead
);

export const departmentHeadRoute = router;