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

export const designationController = {
    createDesignation,
}