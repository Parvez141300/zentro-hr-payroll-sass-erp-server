import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { companyService } from "./company.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";

const getAllOrQueryCompanies = catchAsync(async (req: Request, res: Response) => {
    const query = req.query;

    const search = typeof query.search === "string" ? query.search : undefined;
    const subscriptionPlan = typeof query.subscriptionPlan === "string" ? query.subscriptionPlan : undefined;
    const subscriptionStatus = typeof query.subscriptionStatus === "string" ? query.subscriptionStatus : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(query);

    const result = await companyService.getAllOrQueryCompaniesFromDB({ search, subscriptionPlan, subscriptionStatus, page, limit, skip, sortBy, sortOrder });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Companies fetched successfully",
        data: result,
    });
});

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
        httpStatusCode: status.CREATED,
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
    getAllOrQueryCompanies,
    getCompany,
    createCompany,
    updateCompany,
};