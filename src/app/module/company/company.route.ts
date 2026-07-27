import { Router } from "express";
import { companyController } from "./company.contoller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";

const router = Router();

router.get("/", companyController.getAllOrQueryCompanies);
router.get("/:id", companyController.getSingleCompany);
router.get(
    "/own-company",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE, Role.ACCOUNTANT),
    companyController.getUserOwnCompany
);
router.patch(
    "/own-company",
    checkAuthMiddleware(Role.Super_ADMIN),
    companyController.updateOwnCompany
);
router.delete("/:id", companyController.deleteCompany);

export const companyRoute = router;