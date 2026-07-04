import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { accountantService } from "./accountant.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";


const getAllOrQueryAccountant = catchAsync(async (req: Request, res: Response) => {
    const { companyId } = req.user;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);
    const result = await accountantService.getAllOrQueryAccountantFromDB(companyId, { search, page, limit, skip, sortBy, sortOrder });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Accountants fetched successfully",
        data: result,
    });
});

const getAccountantOwnProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await accountantService.getAccountOwnerFromDB(user.companyId, user.userId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Accountant fetched successfully",
        data: result,
    });
});

const updateCompanyAccountant = catchAsync(async (req: Request, res: Response) => {
    
    const payload = req.body;
    const user = req.user;
    const role = user.role as Role;
    const result = await accountantService.updateCompanyAccountantInDB(user.companyId, user.userId as string, role, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company accountant updated successfully",
        data: result,
    });
});

const deleteCompanyAccountant = catchAsync(async (req: Request, res: Response) => {
    const { id: accountantId } = req.params;
    const user = req.user;
    const result = await accountantService.deleteCompanyAccountantFromDB(user.companyId, accountantId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company accountant deleted successfully",
        data: result,
    });
});

export const accountantController = {
    getAllOrQueryAccountant,
    getAccountantOwnProfile,
    updateCompanyAccountant,
    deleteCompanyAccountant,
};