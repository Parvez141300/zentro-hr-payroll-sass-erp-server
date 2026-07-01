import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { authService } from "./auth.service";
import { tokenUtils } from "../../utils/token";
import { cookieUtils } from "../../utils/cookie";
import { envVars } from "../../utils/env";

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
    const { accessToken, refreshToken, token, ...rest } = result;

    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionTokenInCookie(res, token);

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

const getNewToken = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];
    const refreshToken = req.cookies["refreshToken"];

    if (!refreshToken) {
        throw new Error("Refresh token is missing");
    }

    const { accessToken, refreshToken: newRefreshToken, sessionToken: token } = await authService.getNewTokenFromDB(sessionToken, refreshToken);

    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, newRefreshToken);
    tokenUtils.setBetterAuthSessionTokenInCookie(res, token);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Token refreshed successfully",
        data: {
            token: token,
            accessToken: accessToken,
            refreshToken: newRefreshToken,
        }
    });
});

const logoutUser = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];
    const result = await authService.logoutUserInDB(sessionToken);

    cookieUtils.clearCookie(
        res,
        "accessToken",
        {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
        }
    );
    cookieUtils.clearCookie(
        res,
        "refreshToken",
        {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
        }
    );
    cookieUtils.clearCookie(
        res,
        "better-auth.session_token",
        {
            httpOnly: true,
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
        }
    );

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User logged out successfully",
        data: result,
    });
});

const changePassword = catchAsync(async (req: Request, res: Response) => {
    const sessionToken = req.cookies["better-auth.session_token"];
    const payload = req.body;
    const result = await authService.changePassowrdInDB(sessionToken, payload);

    const { accessToken, refreshToken, token } = result;
    tokenUtils.setAccessTokenInCookie(res, accessToken);
    tokenUtils.setRefreshTokenInCookie(res, refreshToken);
    tokenUtils.setBetterAuthSessionTokenInCookie(res, token as string);

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password changed successfully",
        data: result,
    });
});

const forgetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email } = req.body;
    const result = await authService.forgetPasswordInBetterAuth(email);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset email sent successfully",
        data: result,
    });
});

const resetPassword = catchAsync(async (req: Request, res: Response) => {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPasswordInBetterAuth(email, otp, newPassword);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Password reset successfully",
        data: result,
    });
});

const getLoggedInUserInfo = catchAsync(async (req: Request, res: Response) => {
    const accessToken = req.cookies["accessToken"];
    const result = await authService.getLoggedInUserInfoFromDB(accessToken);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User info fetched successfully",
        data: result,
    });
});

export const authController = {
    registerSuperAdmin,
    loginUser,
    getNewToken,
    logoutUser,
    changePassword,
    getLoggedInUserInfo,
    forgetPassword,
    resetPassword,
};