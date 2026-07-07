import { Router } from "express";
import { paymentService } from "./payment.service";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", checkAuthMiddleware(Role.Super_ADMIN), paymentService.getCompanyPaymentsFromDB);

export const paymentRoute = router;