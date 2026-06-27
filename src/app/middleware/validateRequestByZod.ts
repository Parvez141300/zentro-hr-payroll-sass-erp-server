import { NextFunction, Request, Response } from "express";
import z from "zod";

export const validateRequestByZod = (schema: z.ZodObject) => (req: Request, res: Response, next: NextFunction) => {
    const parsedData = schema.safeParse(req.body);
    if (!parsedData.success) {
        return res.status(400).json(parsedData.error);
    }
    next();
}