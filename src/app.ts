import { envVars } from "./app/utils/env";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import { indexRoute } from "./app/routes";
import { notFoundMiddleware } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";
import path from "path";
import crone from "node-cron";
import { companyService } from "./app/module/company/company.service";
import { stripeController } from "./app/module/stripe/stripe.controller";

export const app: Application = express();

// view engine
app.set("view engine", "ejs");
app.set("views", path.resolve(process.cwd(), "src/app/templates"));

// stripe webhook
app.use(
  "/api/v1/stripe/webhook",
  express.raw({ type: 'application/json' }),
  stripeController.handleStripeWebhook
);

// Middleware to parse JSON bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: [
    envVars.FRONTEND_URL,
    envVars.BETTER_AUTH_URL,
    "http://localhost:3000",
    "http://localhost:5000"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(cookieParser());

// node cron job
crone.schedule("*/30 * * * *", async () => {
  try {
    console.log("[cron] Checking expired company subscriptions...");
    const result = await companyService.cancelCompanySubscriptionInDB();
    console.log(
      `[cron] Done. Processed: ${result.totalProcessed}, Failed: ${result.totalFailed}`
    );
  } catch (error) {
    console.error("[cron] Fatal error in subscription expiry job", error);
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
