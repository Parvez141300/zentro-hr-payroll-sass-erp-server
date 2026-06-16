import express, { Application, Request, Response } from "express";
import cors from "cors";
import { indexRoute } from "./app/routes";

export const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());
app.use(cors());

// api route
app.use("/api/v1", indexRoute);

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Zentro HR Payroll SaaS ERP Server is running!');
});
