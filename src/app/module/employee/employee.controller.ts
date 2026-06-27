import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";
import { employeeService } from "./employee.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { EmployeeStatus, EmploymentType } from "../../../generated/prisma/enums";

const getAllOrQueryEmployees = catchAsync(async (req: Request, res: Response) => {
    const { companyId } = req.user;
    const search = typeof req.query.search === "string" ? req.query.search : "";
    const employmentType = typeof req.query.employmentType === "string" ? (req.query.employmentType as EmploymentType) : undefined;
    const employeeStatus = typeof req.query.status === "string" ? (req.query.status as EmployeeStatus) : undefined;
    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);
    const result = await employeeService.getAllOrQueryEmployeesFromDB(companyId, { search, page, limit, skip, sortBy, sortOrder, employmentType, status: employeeStatus });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Employees fetched successfully",
        data: result,
    });
});

export const employeeController = {
    getAllOrQueryEmployees,
};