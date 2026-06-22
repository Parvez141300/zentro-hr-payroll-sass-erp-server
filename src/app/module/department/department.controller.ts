import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { departmentService } from "./department.service";
import status from "http-status";
import { sendResponse } from "../../utils/sendResponse";

const createDepartment = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await departmentService.createDepartmentInDB(payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Department created successfully",
        data: result,
    });
});

export const departmentController = {
    createDepartment,
};