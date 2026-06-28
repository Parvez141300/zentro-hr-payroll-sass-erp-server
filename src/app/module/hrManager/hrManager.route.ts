import { Router } from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { hrManagerController } from "./hrManager.controller";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN),
    hrManagerController.getAllOrQueryHrManagers
);
router.get(
    "/own-profile",
    checkAuthMiddleware(Role.HR_MANAGER),
    hrManagerController.getHrManagerOwnProfile
);
router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    hrManagerController.updateCompanyHr
);
router.delete(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN),
    hrManagerController.deleteCompanyHr
);

export const hrManagerRoute = router;