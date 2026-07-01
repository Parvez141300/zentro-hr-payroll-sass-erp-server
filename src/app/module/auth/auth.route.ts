import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/super-admin/register", authController.registerSuperAdmin);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.getNewToken);

export const authRoute = router;