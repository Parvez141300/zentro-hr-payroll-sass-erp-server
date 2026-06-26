import { Router } from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { designationController } from "./designation.controller";

const router = Router();

router.get("/", checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER), designationController.getCompanyAllOrQueryDesignation);
router.post("/", checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER), designationController.createDesignation);
router.patch("/:id", checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER), designationController.updateDesignation);
router.delete("/:id", checkAuthMiddleware(Role.Super_ADMIN), designationController.deleteDesignation);

export const designationRoute = router;