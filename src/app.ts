import express, { Application, Request, Response } from "express";
import cors from "cors";
import { indexRoute } from "./app/routes";
import { notFoundMiddleware } from "./app/middleware/notFound";
import { globalErrorHandler } from "./app/middleware/globalErrorHandler";
import cookieParser from "cookie-parser";

export const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());
app.use(cookieParser());

// api route
app.use("/api/v1", indexRoute);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Zentro HR Payroll SaaS ERP Server is running!');
});

app.use(notFoundMiddleware);
// global error handler
app.use(globalErrorHandler);
