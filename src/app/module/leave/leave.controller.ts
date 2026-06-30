import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { leaveService } from "./leave.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const applyForLeave = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await leaveService.applyForLeaveInDB(user.companyId, user.userId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Leave applied successfully",
        data: result,
    });
});

export const leaveController = {
    applyForLeave,
};