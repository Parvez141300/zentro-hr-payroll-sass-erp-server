import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get(
    "/super-admin",
    checkAuthMiddleware(Role.Super_ADMIN),
    adminController.getCompanySuperAdminOwnProfile
);

router.patch(
    "/super-admin/:id",
    checkAuthMiddleware(Role.Super_ADMIN),
    adminController.updateCompanySuperAdminOwnProfile
);

export const adminRoute = router;