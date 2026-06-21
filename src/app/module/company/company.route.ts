import { Router } from "express";
import { companyController } from "./company.contoller";

const router = Router();

router.get("/", companyController.getAllOrQueryCompanies);
router.get("/:id", companyController.getSingleCompany);
router.patch("/:id", companyController.updateCompany);
router.delete("/:id", companyController.deleteCompany);

export const companyRoute = router;