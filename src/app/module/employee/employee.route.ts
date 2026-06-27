import { Router } from "express";
import { employeeController } from "./employee.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD), employeeController.getAllOrQueryEmployees
);
router.get(
    "/own-profile",
    checkAuthMiddleware(Role.EMPLOYEE),
    employeeController.getEmployeeOwnProfile
);
router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE), employeeController.updateEmployee
);
router.delete(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    employeeController.deleteEmployee
);

export const employeeRoute = router;