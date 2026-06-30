import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { leaveService } from "./leave.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";
import { LeaveStatus, Role } from "../../../generated/prisma/enums";

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

const getAllOrQueryLeaves = catchAsync(async (req: Request, res: Response) => {
    const { companyId, userId } = req.user;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const userRole = typeof req.query.role === "string" ? (req.query.role as Role) : undefined;
    const startDate = typeof req.query.startDate === "string" ? new Date(req.query.startDate) : undefined;
    const endDate = typeof req.query.endDate === "string" ? new Date(req.query.endDate) : undefined;
    const leaveStatus = typeof req.query.status === "string" ? (req.query.status as LeaveStatus) : undefined;
    const leaveTypeId = typeof req.query.leaveTypeId === "string" ? req.query.leaveTypeId : undefined;
    const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
    const designationId = typeof req.query.designationId === "string" ? req.query.designationId : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);

    const result = await leaveService.getAllOrQueryLeavesFromDB(companyId, userId, userRole as Role, { search, page, limit, skip, sortBy, sortOrder, startDate, endDate, status: leaveStatus, leaveTypeId, departmentId, designationId });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Leaves fetched successfully",
        data: result,
    });
});

const employeeLeaveUpdate = catchAsync(async (req: Request, res: Response) => {
    const { id: leaveId } = req.params;
    const user = req.user;
    const payload = req.body;
    const result = await leaveService.employeeLeaveUpdateInDB(user.companyId, leaveId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Leave updated successfully",
        data: result,
    });
});

const updateLeave = catchAsync(async (req: Request, res: Response) => {
    const { id: leaveId } = req.params;
    const user = req.user;
    const payload = req.body;
    const result = await leaveService.updateLeaveInDB(user.companyId, user.userId, leaveId as string, user.role as Role, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Leave updated successfully",
        data: result,
    });
});

const deleteLeave = catchAsync(async (req: Request, res: Response) => {
    const { id: leaveId } = req.params;
    const user = req.user;
    const result = await leaveService.deleteLeaveFromDB(user.companyId, leaveId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Leave deleted successfully",
        data: result,
    });
});

export const leaveController = {
    applyForLeave,
    getAllOrQueryLeaves,
    employeeLeaveUpdate,
    updateLeave,
    deleteLeave,
};