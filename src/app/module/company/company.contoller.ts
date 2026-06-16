import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { companyService } from "./company.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const getCompany = catchAsync(async (req: Request, res: Response) => {
    const { id: companyId } = req.params;
    const result = await companyService.getCompanyFromDB(companyId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company fetched successfully",
        data: result,
    });
});

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

const updateCompany = catchAsync(async (req: Request, res: Response) => {
    const { id: companyId } = req.params;
    const payload = req.body;
    const result = await companyService.updateCompanyInDB(companyId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company updated successfully",
        data: result,
    });
});

export const companyController = {
    getCompany,
    createCompany,
    updateCompany,
};