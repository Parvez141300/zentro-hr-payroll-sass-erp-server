import { Router } from "express";
import { adminController } from "./admin.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { multerUploadService } from "../../config/cloudinary.utils";
import { updateProfileMiddlewareSecond } from "../../middleware/updateProfileMiddlewareSecond";

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
    "/super-admin",
    checkAuthMiddleware(Role.Super_ADMIN),
    multerUploadService.single("file"),
    updateProfileMiddlewareSecond,
    adminController.updateCompanySuperAdminOwnProfile
);

router.patch(
    "/platform-super-admin",
    checkAuthMiddleware(Role.PLATFORM_SUPER_ADMIN),
    multerUploadService.single("file"),
    updateProfileMiddlewareSecond,
    adminController.updatePlatformSuperAdminProfile
);

export const adminRoute = router;