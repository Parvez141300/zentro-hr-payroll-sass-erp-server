import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { hrManagerService } from "./hrManager.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";


const getAllOrQueryHrManagers = catchAsync(async (req: Request, res: Response) => {
    const { companyId } = req.user;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);
    const result = await hrManagerService.getAllOrQueryHrManagersFromDB(companyId, { search, page, limit, skip, sortBy, sortOrder });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Hr managers fetched successfully",
        data: result,
    });
});

const getHrManagerOwnProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await hrManagerService.getHrManagerOwnProfileFromDB(user.companyId, user.userId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Hr manager fetched successfully",
        data: result,
    });
})

const updateCompanyHr = catchAsync(async (req: Request, res: Response) => {
    const { id: hrId } = req.params;
    const payload = req.body;
    const user = req.user;
    const role = user.role as Role;
    const result = await hrManagerService.updateCompanyHrInDB(user.companyId, hrId as string, role, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company HR updated successfully",
        data: result,
    });
});

const deleteCompanyHr = catchAsync(async (req: Request, res: Response) => {
    const { id: hrId } = req.params;
    const user = req.user;
    const result = await hrManagerService.deleteCompanyHrFromDB(user.companyId, hrId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company HR deleted successfully",
        data: result,
    });
});

export const hrManagerController = {
    getAllOrQueryHrManagers,
    updateCompanyHr,
    deleteCompanyHr,
    getHrManagerOwnProfile,
};