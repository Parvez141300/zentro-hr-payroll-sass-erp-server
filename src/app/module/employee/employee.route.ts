
import { employeeController } from "./employee.controller";
import { checkAuthMiddleware } from "../../middleware/checkAuthMiddleware";
import { Role } from "../../../generated/prisma/enums";
// import { updateProfileMiddleware } from "../../middleware/updateProfileMiddleware";
// import {
//     multerUpload
// } from "../../config/multer.config";
import { Router } from "express";
import { updateProfileMiddlewareSecond } from "../../middleware/updateProfileMiddlewareSecond";
import { multerUploadService } from "../../config/cloudinary.utils";

const router = Router();

router.get(
    "/",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.DEPARTMENT_HEAD), employeeController.getAllOrQueryEmployees
);
router.get(
    "/own-profile",
    checkAuthMiddleware(Role.EMPLOYEE),
    employeeController.getEmployeeOwnProfile
);
router.patch(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER, Role.EMPLOYEE),
    // multerUpload.fields([{ name: "profilePhoto", maxCount: 1 }]),
    multerUploadService.single("file"),
    // updateProfileMiddleware,
    updateProfileMiddlewareSecond,
    employeeController.updateEmployee
);
router.delete(
    "/:id",
    checkAuthMiddleware(Role.Super_ADMIN, Role.HR_MANAGER),
    employeeController.deleteEmployee
);


export const employeeRoute = router;