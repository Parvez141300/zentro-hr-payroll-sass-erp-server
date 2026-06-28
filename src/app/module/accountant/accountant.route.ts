import { Router } from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { accountantController } from "./accountant.controller";

const router = Router();

router.patch(
    "/update-company-accountant/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.ACCOUNTANT),
    accountantController.updateCompanyAccountant
);

export const accountantRoute = router;