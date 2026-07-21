import express, { Application, Request, Response } from "express";
import cors from "cors";
import { indexRoute } from "./app/routes";
import { notFoundMiddleware } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import path from "path";
import { envVars } from "./app/utils/env";
import crone from "node-cron";
import { companyService } from "./app/module/company/company.service";

export const app: Application = express();

// view engine
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());

// node cron job
crone.schedule("*/5 * * * *", async () => {
  try {
    console.log("running a task every 5 minutes to check company subscription status is expired or not");
    await companyService.cancelCompanySubscriptionInDB();
  } catch (error) {
    console.log("error from node cron job", error);
  }
});

// api route
app.use("/api/v1", indexRoute);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Zentro HR Payroll SaaS ERP Server is running!');
});

app.use(notFoundMiddleware);
// global error handler
app.use(globalErrorHandler);
