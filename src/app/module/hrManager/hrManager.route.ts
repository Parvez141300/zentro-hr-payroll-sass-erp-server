import { Router } from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { hrManagerController } from "./hrManager.controller";

const router = Router();

router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    hrManagerController.updateCompanyHr
);

export const hrManagerRoute = router;