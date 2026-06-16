import { Router } from "express";
import { companyController } from "./company.contoller";

const router = Router();

router.post("/", companyController.createCompany);

export const companyRoute = router;