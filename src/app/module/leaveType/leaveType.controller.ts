import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { leaveTypeService } from "./leaveType.service";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";

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

const getAllOrQueryLeaveTypes = catchAsync(async (req: Request, res: Response) => {
    const { companyId } = req.user;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const isActive = typeof req.query.isActive === "boolean" ? req.query.isActive : undefined;
    const isPaid = typeof req.query.isPaid === "boolean" ? req.query.isPaid : undefined;
    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);
    const result = await leaveTypeService.getAllOrQueryLeaveTypesFromDB(companyId, { search, page, limit, skip, sortBy, sortOrder, isActive, isPaid });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Leave types fetched successfully",
        data: result,
    });
});

const updateLeaveType = catchAsync(async (req: Request, res: Response) => {
    const { id: leaveTypeId } = req.params;
    const user = req.user;
    const payload = req.body;
    const result = await leaveTypeService.updateLeaveTypeInDB(user.companyId, leaveTypeId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Leave type updated successfully",
        data: result,
    });
});

const deleteLeaveType = catchAsync(async (req: Request, res: Response) => {
    const { id: leaveTypeId } = req.params;
    const user = req.user;
    const result = await leaveTypeService.deleteLeaveTypeFromDB(user.companyId, leaveTypeId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Leave type deleted successfully",
        data: result,
    });
});

export const leaveTypeController = {
    createLeaveType,
    getAllOrQueryLeaveTypes,
    updateLeaveType,
    deleteLeaveType,
};