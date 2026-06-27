import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/create-company-hr", userController.createCompanyHr);
router.post("/create-company-accountant", userController.createCompanyAccountant);

export const userRoute = router;