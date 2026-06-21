import { Router } from "express";
import { authController } from "./auth.controller";

const router = Router();

router.post("/super-admin/register", authController.registerSuperAdmin);
router.post("/login", authController.loginUser);


export const authRoute = router;