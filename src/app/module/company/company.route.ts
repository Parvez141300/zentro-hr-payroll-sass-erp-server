import { Router } from "express";
import { companyController } from "./company.contoller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
import { multerUploadService } from "../../config/cloudinary.utils";
import { updateCompanyProfileMiddleware } from "../../middleware/updateCompanyProfileMiddleware";

const router = Router();

router.get("/", companyController.getAllOrQueryCompanies);
router.get("/single-company/:id", companyController.getSingleCompany);
router.get(
    "/own-company",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD, Role.EMPLOYEE, Role.ACCOUNTANT),
    companyController.getUserOwnCompany
);
router.patch(
    "/own-company",
    checkAuthMiddleware(Role.Super_ADMIN),
    multerUploadService.fields([
        { name: "logo", maxCount: 1 },
        { name: "banner", maxCount: 5 }, // banner একাধিক হতে পারলে
    ]),
    updateCompanyProfileMiddleware,
    companyController.updateOwnCompany
);
router.delete("/:id", companyController.deleteCompany);

export const companyRoute = router;