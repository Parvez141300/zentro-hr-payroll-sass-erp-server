import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { departmentService } from "./department.service";
import status from "http-status";
import { sendResponse } from "../../utils/sendResponse";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";

const getCompanyAllOrQueryDepartments = catchAsync(async (req: Request, res: Response) => {
    const { companyId } = req.user;
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);
    const result = await departmentService.getCompanyAllOrQueryDepartmentsFromDB(companyId, { search, page, limit, skip, sortBy, sortOrder });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Departments fetched successfully",
        data: result,
    });
});

const createDepartment = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const { companyId } = req.user;
    const result = await departmentService.createDepartmentInDB(companyId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Department created successfully",
        data: result,
    });
});

const updateDepartment = catchAsync(async (req: Request, res: Response) => {
    const { id: departmentId } = req.params;
    const payload = req.body;
    const result = await departmentService.updateDepartmentInDB(departmentId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Department updated successfully",
        data: result,
    });
});

const deleteDepartment = catchAsync(async (req: Request, res: Response) => {
    const { id: departmentId } = req.params;
    const result = await departmentService.deleteCompanyDepartmentInDB(departmentId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Department deleted successfully",
        data: result,
    });
});

export const departmentController = {
    getCompanyAllOrQueryDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment,
};