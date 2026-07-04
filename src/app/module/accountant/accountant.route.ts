import { Router } from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { accountantController } from "./accountant.controller";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN),
    accountantController.getAllOrQueryAccountant
);
router.get(
    "/own-profile", 
    checkAuthMiddleware(Role.ACCOUNTANT), 
    accountantController.getAccountantOwnProfile
);
router.patch(
    "/update-company-accountant",
    checkAuthMiddleware(Role.Super_ADMIN, Role.ACCOUNTANT),
    accountantController.updateCompanyAccountant
);
router.delete(
    "/delete-company-accountant/:id",
    checkAuthMiddleware(Role.Super_ADMIN),
    accountantController.deleteCompanyAccountant
);

export const accountantRoute = router;