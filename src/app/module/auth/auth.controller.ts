import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const registerSuperAdmin = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await registerSuperAdminInDB(payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Super Admin registered successfully",
        data: result,
    });
});