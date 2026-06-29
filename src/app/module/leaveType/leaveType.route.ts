import { Router } from "express";
import { leaveTypeController } from "./leaveType.controller";

const router = Router();

router.get("/", leaveTypeController.getAllOrQueryLeaveTypes);
router.post("/", leaveTypeController.createLeaveType);
router.patch("/:id", leaveTypeController.updateLeaveType);
router.delete("/:id", leaveTypeController.deleteLeaveType);

export const leaveTypeRoute = router;