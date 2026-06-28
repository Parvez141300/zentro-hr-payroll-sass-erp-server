import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { attendanceService } from "./attendance.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const markAttendance = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await attendanceService.markAttendanceInDB(user.companyId, user.userId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Attendance marked successfully",
        data: result,
    });
});

export const attendanceController = {
    markAttendance
};