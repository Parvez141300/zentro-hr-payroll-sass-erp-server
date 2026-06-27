import { Router } from "express";
import { userController } from "./user.controller";

const router = Router();

router.post("/create-company-hr", userController.createCompanyHr);

export const userRoute = router;