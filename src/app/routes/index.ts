import { Router } from "express";
import { companyRoute } from "../module/company/company.route";

const router = Router();

router.use("/companies", companyRoute);

export const indexRoute = router;