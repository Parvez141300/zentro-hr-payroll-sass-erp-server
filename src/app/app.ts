import express, { Application, Request, Response } from "express";

export const app: Application = express();

// Enable URL-encoded form data parsing
app.use(express.urlencoded({ extended: true }));

// Middleware to parse JSON bodies
app.use(express.json());

// Basic route
app.get('/', (req: Request, res: Response) => {
  res.send('Zentro HR Payroll SaaS ERP Server is running!');
});
