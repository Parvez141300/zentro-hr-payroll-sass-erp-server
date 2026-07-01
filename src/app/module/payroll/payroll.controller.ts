import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { payrollService } from "./payroll.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { PayrollStatus, Role } from "../../../generated/prisma/enums";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";

const generatePayroll = catchAsync(async (req: Request, res: Response) => {
    const { companyId, userId } = req.body; // Assuming companyId and userId are sent in the request body
    const payload = req.body.payload; // Assuming payload is sent in the request body
    const result = await payrollService.generatePayrollInDB(companyId, userId, payload);
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Payroll generated successfully",
        data: result,
    });
});

const getAllOrQueryPayrolls = catchAsync(async (req: Request, res: Response) => {
    const user = req.user; // Assuming user information is available in the request object
    const search = typeof req.query.search === "string" ? req.query.search : undefined;
    const payrollStatus = typeof req.query.status === "string" ? req.query.status : undefined;
    const month = typeof req.query.month === "number" ? parseInt(req.query.month) : undefined;
    const year = typeof req.query.year === "number" ? parseInt(req.query.year) : undefined;
    const startDate = typeof req.query.startDate === "string" ? new Date(req.query.startDate) : undefined;
    const endDate = typeof req.query.endDate === "string" ? new Date(req.query.endDate) : undefined;
    const departmentId = typeof req.query.departmentId === "string" ? req.query.departmentId : undefined;
    const designationId = typeof req.query.designationId === "string" ? req.query.designationId : undefined;


    const { page, limit, skip, sortBy, sortOrder } = paginationAndSortingHelper(req.query);

    const result = await payrollService.getAllOrQueryPayrollsFromDB(user.companyId, user.userId, user.role as Role, { page, limit, skip, sortBy, sortOrder, search, month, year, status: payrollStatus as PayrollStatus, startDate, endDate, departmentId, designationId });
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Payrolls fetched successfully",
        data: result,
    });
});

export const payrollController = {
    generatePayroll,
    getAllOrQueryPayrolls,
};