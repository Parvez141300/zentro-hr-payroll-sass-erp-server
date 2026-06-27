/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express"
import { envVars } from "../utils/env"
import status from "http-status";

export const globalErrorHandler = async (error: any, req: Request, res: Response, next: NextFunction) => {
    if (envVars.NODE_ENV === "development") {
        console.log('This error is from global error handler', error);
    }

    let stack: string | undefined = undefined;
    let statusCode: number = status.INTERNAL_SERVER_ERROR;
    let message: string = "Internal server error";

    if (error instanceof Error) {
        stack = error.stack;
        statusCode = status.INTERNAL_SERVER_ERROR;
        message = error.message;
    }


    return res.status(statusCode).json({
        success: false,
        message: message,
        stack: envVars.NODE_ENV === "development" ? stack : undefined,
        error: envVars.NODE_ENV === "development" ? error : undefined,
    });
}