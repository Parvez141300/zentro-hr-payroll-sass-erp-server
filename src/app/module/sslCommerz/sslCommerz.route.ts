import { Router } from "express";
import { sslCommerzController } from "./sslCommerz.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.post(
    "/initiate", 
    checkAuthMiddleware(Role.Super_ADMIN),
    sslCommerzController.initiateSSLCommerzPayment
);
router.post("/success", sslCommerzController.handleSSLCommerzSuccess);
router.post("/failed", sslCommerzController.handleSSLCommerzFail);
router.post("/cancel", sslCommerzController.handleSSLCommerzCancel);

export const sslCommerzRoute = router;