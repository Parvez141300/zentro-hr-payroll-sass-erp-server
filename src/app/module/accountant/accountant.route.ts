import { Router } from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { accountantController } from "./accountant.controller";
import { multerUploadService } from "../../config/cloudinary.utils";
import { updateProfileMiddlewareSecond } from "../../middleware/updateProfileMiddlewareSecond";

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
    "/update-company-accountant/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.ACCOUNTANT),
    multerUploadService.single("file"),
    updateProfileMiddlewareSecond,
    accountantController.updateCompanyAccountant
);
router.delete(
    "/delete-company-accountant/:id",
    checkAuthMiddleware(Role.Super_ADMIN),
    accountantController.deleteCompanyAccountant
);

export const accountantRoute = router;