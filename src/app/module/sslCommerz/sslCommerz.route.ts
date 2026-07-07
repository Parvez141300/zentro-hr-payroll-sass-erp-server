import { Router } from "express";
import { sslCommerzController } from "./sslCommerz.controller";

const router = Router();

router.post("/initiate", sslCommerzController.initiateSSLCommerzPayment);
router.post("/success", sslCommerzController.handleSSLCommerzSuccess);
router.post("/failed", sslCommerzController.handleSSLCommerzFail);
router.post("/cancel", sslCommerzController.handleSSLCommerzCancel);

export const sslCommerzRoute = router;