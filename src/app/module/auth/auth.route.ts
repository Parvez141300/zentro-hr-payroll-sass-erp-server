import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/super-admin/register", authController.registerSuperAdmin);
router.post("/login", authController.loginUser);
router.post("/refresh-token", authController.getNewToken);
router.post("/logout", authController.logoutUser);
router.post("/change-password", authController.changePassword);
router.get("/me", authController.getLoggedInUserInfo);
router.post("/forget-password", authController.forgetPassword);
router.post("/reset-password", authController.resetPassword);

export const authRoute = router;