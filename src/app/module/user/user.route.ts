import { Router } from "express";
import { userController } from "./user.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post("/create-company-hr", checkAuthMiddleware(Role.Super_ADMIN), userController.createCompanyHr);
router.post("/create-company-accountant", checkAuthMiddleware(Role.Super_ADMIN), userController.createCompanyAccountant);

export const userRoute = router;