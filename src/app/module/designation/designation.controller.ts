import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { designationService } from "./designation.service";

const createDesignation = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const result = await designationService.createDesignationInDB(user.companyId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Designation created successfully",
        data: result,
    });
});

const updateDesignation = catchAsync(async (req: Request, res: Response) => {
    const { id: designationId } = req.params;
    const payload = req.body;
    const result = await designationService.updateDesignationInDB(designationId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Designation updated successfully",
        data: result,
    });
});

const deleteDesignation = catchAsync(async (req: Request, res: Response) => {
    const { id: designationId } = req.params;
    const result = await designationService.deleteDesignationInDB(designationId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Designation deleted successfully",
        data: result,
    });
});

export const designationController = {
    createDesignation,
    updateDesignation,
    deleteDesignation,
}