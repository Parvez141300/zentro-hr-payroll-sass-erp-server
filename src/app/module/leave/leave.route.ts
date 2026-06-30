import { Router } from "express";
import { leaveController } from "./leave.controller";

const router = Router();

router.post("/", leaveController.applyForLeave);
router.get("/", leaveController.getAllOrQueryLeaves);

export const leaveRoute = router;