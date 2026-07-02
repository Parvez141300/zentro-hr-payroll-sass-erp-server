import { Router } from "express";
import { statsController } from "./statscontroller";

const router = Router();

router.get("/dashboard/stats", statsController.getDashboardStats)

export const statsRoute = router;