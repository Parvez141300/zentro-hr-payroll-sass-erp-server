import { Router } from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { designationController } from "./designation.controller";

const router = Router();

router.post("/", checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER), designationController.createDesignation);

export const designationRoute = router;