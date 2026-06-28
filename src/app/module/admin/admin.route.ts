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

router.get(
    "/platform-super-admin",
    checkAuthMiddleware(Role.PLATFORM_SUPER_ADMIN),
    adminController.getPlatformSuperAdminProfile
);

router.patch(
    "/super-admin/:id",
    checkAuthMiddleware(Role.Super_ADMIN),
    adminController.updateCompanySuperAdminOwnProfile
);

router.patch(
    "/platform-super-admin/:id",
    checkAuthMiddleware(Role.PLATFORM_SUPER_ADMIN),
    adminController.updatePlatformSuperAdminProfile
);

export const adminRoute = router;