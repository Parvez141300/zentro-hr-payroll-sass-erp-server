import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { authService } from "./auth.service";

const registerSuperAdmin = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await authService.registerSuperAdminInDB(payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Super Admin registered successfully",
        data: result,
    });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await authService.loginUserInDB(payload);
    const {accessToken, refreshToken, token, ...rest} = result;
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged in successfully",
        data: {
            token,
            accessToken,
            refreshToken,
            ...rest
        },
    });
});

export const authController = {
    registerSuperAdmin,
    loginUser,
};