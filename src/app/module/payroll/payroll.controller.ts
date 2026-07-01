import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { payrollService } from "./payroll.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const generatePayroll = catchAsync(async (req: Request, res: Response) => {
    const { companyId, userId } = req.body; // Assuming companyId and userId are sent in the request body
    const payload = req.body.payload; // Assuming payload is sent in the request body
    const result = await payrollService.generatePayrollInDB(companyId, userId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Payroll generated successfully",
        data: result,
    });
});

export const payrollController = {
    generatePayroll,
};