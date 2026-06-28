import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";
import { Role } from "../../../generated/prisma/enums";

const getAllOrQueryUsers = catchAsync(async (req: Request, res: Response) => {
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);
    const isActive = typeof req.query.isActive === "boolean" ? req.query.isActive : undefined;
    const role = typeof req.query.role === "string" ? (req.query.role as Role) : undefined;

    const result = await userService.getAllOrQueryUsersFromDB({ search, page, limit, skip, sortBy, sortOrder, isActive, role });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
});

const getAllOrQueryCompanyUsers = catchAsync(async (req: Request, res: Response) => {
    const { companyId } = req.user;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const isActive = typeof req.query.isActive === "boolean" ? req.query.isActive : undefined;
    const role = typeof req.query.role === "string" ? (req.query.role as Role) : undefined;

    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);

    const result = await userService.getAllOrQueryCompanyUsersFromDB(companyId, { search, page, limit, skip, sortBy, sortOrder, isActive, role });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Users fetched successfully",
        data: result,
    });
});

const getSingleCompanyUser = catchAsync(async (req: Request, res: Response) => {
    const { id: userId } = req.params;
    const user = req.user;
    const result = await userService.getSingleCompanyUserFromDB(user.companyId, userId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "User fetched successfully",
        data: result,
    });
});

const createCompanyHr = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const result = await userService.createCompanyHrInDB(user.companyId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Company HR created successfully",
        data: result,
    });
});

const createCompanyAccountant = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const result = await userService.createCompanyAccountantInDB(user.companyId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Company accountant created successfully",
        data: result,
    });
});

const createCompanyDepartmentHead = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const result = await userService.createCompanyDepartmentHeadInDB(user.companyId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Company department head created successfully",
        data: result,
    });
});

const createCompanyEmployee = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const user = req.user;
    const result = await userService.createCompanyEmployeeInDB(user.companyId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Company employee created successfully",
        data: result,
    });
});

export const userController = {
    createCompanyHr,
    createCompanyAccountant,
    createCompanyDepartmentHead,
    createCompanyEmployee,
    getAllOrQueryCompanyUsers,
    getSingleCompanyUser,
    getAllOrQueryUsers,
};