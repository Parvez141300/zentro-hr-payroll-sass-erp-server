/* eslint-disable @typescript-eslint/no-unused-vars */
import { success } from "better-auth";
import { NextFunction, Request, Response } from "express";
import status from "http-status";

export const notFoundMiddleware = (req: Request, res: Response, next: NextFunction) => {
    return res.status(status.NOT_FOUND).json({
        success: false,
        message: `Route ${req.originalUrl} not found`,
    });
};