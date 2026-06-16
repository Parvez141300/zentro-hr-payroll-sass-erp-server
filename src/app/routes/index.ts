import { Router } from "express";
import { companyRoute } from "../module/company/company.route";

const router = Router();

router.use("/company", companyRoute);

export const indexRoute = router;