import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/super-admin/register", authController.registerSuperAdmin);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.getNewToken);
router.post("/logout", authController.logoutUser);

export const authRoute = router;