import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/create-company-hr",
    checkAuthMiddleware(Role.Super_ADMIN),
    userController.createCompanyHr
);
router.patch(
    "/update-company-hr/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    userController.updateCompanyHr
);
router.post(
    "/create-company-accountant",
    checkAuthMiddleware(Role.Super_ADMIN),
    userController.createCompanyAccountant
);
router.post(
    "/create-company-department-head",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    userController.createCompanyDepartmentHead
);
router.post(
    "/create-company-employee",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD),
    userController.createCompanyEmployee
);

export const userRoute = router;