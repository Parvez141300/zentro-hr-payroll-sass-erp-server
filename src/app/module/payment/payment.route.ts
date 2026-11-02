import { Router } from "express";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { paymentController } from "./payment.controller";

const router = Router();

router.get("/", checkAuthMiddleware(Role.Super_ADMIN), paymentController.getCompanyPayments);

export const paymentRoute = router;