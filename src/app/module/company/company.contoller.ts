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
    const isDeleted = typeof Boolean(query.isDeleted) === "boolean" ? Boolean(query.isDeleted) : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(query);

    const result = await companyService.getAllOrQueryCompaniesFromDB({ search, subscriptionPlan, subscriptionStatus, isDeleted, page, limit, skip, sortBy, sortOrder });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Companies fetched successfully",
        data: result,
    });
});

const getSingleCompany = catchAsync(async (req: Request, res: Response) => {
    const { id: companyId } = req.params;
    const result = await companyService.getSingleCompanyFromDB(companyId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company fetched successfully",
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

const deleteCompany = catchAsync(async (req: Request, res: Response) => {
    const { id: companyId } = req.params;
    const result = await companyService.deleteCompany(companyId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company deleted successfully",
        data: result,
    });
});

export const companyController = {
    getAllOrQueryCompanies,
    getSingleCompany,
    updateCompany,
    deleteCompany,
};