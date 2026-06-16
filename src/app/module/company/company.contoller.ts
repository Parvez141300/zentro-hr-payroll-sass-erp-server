import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { companyService } from "./company.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const createCompany = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await companyService.createCompanyInDB(payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company created successfully",
        data: result,
    });
});

export const companyController = {
    createCompany,
};