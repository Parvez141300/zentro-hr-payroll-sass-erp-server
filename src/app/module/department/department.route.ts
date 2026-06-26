import { Router } from "express";
import { departmentController } from "./department.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();


router.get("/", checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER), departmentController.getAllCompanyDepartments);
router.post(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    departmentController.createDepartment
);
router.patch("/:id", checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER), departmentController.updateDepartment);
router.delete("/:id", checkAuthMiddleware(Role.Super_ADMIN), departmentController.deleteDepartment);

export const departmentRoute = router;