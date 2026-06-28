import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/all-users", 
    checkAuthMiddleware(Role.PLATFORM_SUPER_ADMIN), 
    userController.getAllOrQueryUsers
);

router.get("/all-company-users",
    checkAuthMiddleware(Role.Super_ADMIN),
    userController.getAllOrQueryCompanyUsers
);

router.get(
    "/:id", 
    checkAuthMiddleware(Role.Super_ADMIN, Role.PLATFORM_SUPER_ADMIN), 
    userController.getSingleCompanyUser
);

router.post(
    "/create-company-hr",
    checkAuthMiddleware(Role.Super_ADMIN),
    userController.createCompanyHr
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

router.delete(
    "/delete/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.PLATFORM_SUPER_ADMIN),
    userController.deleteUser
);

export const userRoute = router;