import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { attendanceService } from "./attendance.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";
import { AttendanceStatus, Role } from "../../../generated/prisma/enums";

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

const getAllOrQueryAttendance = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const startDate = typeof req.query.startDate === "string" ? new Date(req.query.startDate) : undefined;
    const endDate = typeof req.query.endDate === "string" ? new Date(req.query.endDate) : undefined;
    const attendanceStatus = typeof req.query.status === "string" ? (req.query.status as AttendanceStatus) : undefined;
    const role = typeof req.query.role === "string" ? (req.query.role as Role) : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);

    const result = await attendanceService.getAllOrQueryAttendanceFromDB(user.companyId, user.userId, role as Role, { page, limit, skip, sortBy, sortOrder, startDate, endDate, search, status: attendanceStatus });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance fetched successfully",
        data: result,
    });
});

const getAttendanceById = catchAsync(async (req: Request, res: Response) => {
    const { id: attendanceId } = req.params;
    const user = req.user;
    const result = await attendanceService.getAttendanceByIdFromDB(user.companyId, attendanceId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Attendance fetched successfully",
        data: result,
    });
});

export const attendanceController = {
    markAttendance,
    getAllOrQueryAttendance,
    getAttendanceById,
};