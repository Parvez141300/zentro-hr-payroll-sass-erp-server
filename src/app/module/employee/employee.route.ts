import { Router } from "express";
import { employeeController } from "./employee.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD), employeeController.getAllOrQueryEmployees
);
router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE), employeeController.updateEmployee
);

export const employeeRoute = router;