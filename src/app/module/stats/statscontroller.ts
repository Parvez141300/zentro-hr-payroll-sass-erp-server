import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { statsService } from "./stats.service";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { sendResponse } from "../../utils/sendResponse";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const { companyId, userId, role } = req.user;
    const queryPayload = req.query;
    const result = await statsService.getDashboardStatsFromDB(companyId, userId, role as Role, queryPayload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Dashboard stats fetched successfully",
        data: result,
    });
});

const getDepartmentStats = catchAsync(async (req: Request, res: Response) => {
    const { companyId, userId, role } = req.user;
    const departmentId = typeof req.params.departmentId === "string" ? req.params.departmentId : undefined;
    const result = await statsService.getDepartmentStatsFromDB(companyId, userId, role as Role, departmentId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Department report fetched successfully",
        data: result,
    });
});

const getAttendanceStats = catchAsync(async (req: Request, res: Response) => {
    const { companyId, userId, role } = req.user;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const result = await statsService.getAttendanceStatsFromDB(companyId, userId, role as Role, month, year);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance stats fetched successfully",
        data: result,
    });
});

export const statsController = {
    getDashboardStats,
    getDepartmentStats,
    getAttendanceStats,
};