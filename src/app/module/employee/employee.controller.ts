import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";
import { employeeService } from "./employee.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { EmployeeStatus, EmploymentType, Role } from "../../../generated/prisma/enums";

const getAllOrQueryEmployees = catchAsync(async (req: Request, res: Response) => {
    const { companyId, role, email } = req.user;
    const userRole = role ? role as Role : undefined;

    const search = typeof req.query.search === "string" ? req.query.search : "";
    const employmentType = typeof req.query.employmentType === "string" ? (req.query.employmentType as EmploymentType) : undefined;
    const employeeStatus = typeof req.query.status === "string" ? (req.query.status as EmployeeStatus) : undefined;
    const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
    const designationId = typeof req.query.designationId === "string" ? req.query.designationId : undefined;
    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);
    const result = await employeeService.getAllOrQueryEmployeesFromDB(companyId, email, userRole, { search, page, limit, skip, sortBy, sortOrder, employmentType, status: employeeStatus, departmentId, designationId });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employees fetched successfully",
        data: result,
    });
});

const getEmployeeOwnProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await employeeService.getEmployeeOwnProfileFromDB(user.companyId, user.email);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee fetched successfully",
        data: result,
    });
});

const updateEmployee = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const role = user.role as Role;
    const { id: employeeId } = req.params;
    const payload = req.body;
    const result = await employeeService.updateEmployeeInDB(user.companyId, employeeId as string, role, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee updated successfully",
        data: result,
    });
});

const deleteEmployee = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const { id: employeeId } = req.params;
    const result = await employeeService.deleteEmployeeInDB(user.companyId, employeeId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employee deleted successfully",
        data: result,
    });
});

export const employeeController = {
    getAllOrQueryEmployees,
    getEmployeeOwnProfile,
    updateEmployee,
    deleteEmployee,
};