import { Router } from "express";
import { companyController } from "./company.contoller";

const router = Router();

router.get("/", companyController.getAllCompanies);
router.get("/:id", companyController.getCompany);
router.post("/", companyController.createCompany);
router.patch("/:id", companyController.updateCompany);

export const companyRoute = router;