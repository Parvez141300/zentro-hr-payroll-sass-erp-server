import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { leaveTypeService } from "./leaveType.service";

const createLeaveType = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await leaveTypeService.createLeaveTypeInDB(user.companyId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Leave type created successfully",
        data: result,
    });
});

export const leaveTypeController = {
    createLeaveType,
};