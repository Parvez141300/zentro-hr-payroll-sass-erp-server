import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { userService } from "./user.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

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

const updateCompanyHr = catchAsync(async (req: Request, res: Response) => {
    const { id: hrId } = req.params;
    const payload = req.body;
    const user = req.user;
    const result = await userService.updateCompanyHrInDB(user.companyId, hrId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company HR updated successfully",
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

const updateCompanyAccountant = catchAsync(async (req: Request, res: Response) => {
    const { id: accountantId } = req.params;
    const payload = req.body;
    const user = req.user;
    const result = await userService.updateCompanyAccountantInDB(user.companyId, accountantId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company accountant updated successfully",
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

const updateCompanyDepartmentHead = catchAsync(async (req: Request, res: Response) => {
    const { id: departmentHeadId } = req.params;
    const payload = req.body;
    const user = req.user;
    const result = await userService.updateCompanyDepartmentHeadInDB(user.companyId, departmentHeadId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company department head updated successfully",
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

const updateCompanyEmployee = catchAsync(async (req: Request, res: Response) => {
    const { id: employeeId } = req.params;
    const payload = req.body;
    const user = req.user;
    const result = await userService.updateCompanyEmployeeInDB(user.companyId, employeeId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company employee updated successfully",
        data: result,
    });
});

export const userController = {
    createCompanyHr,
    updateCompanyHr,
    createCompanyAccountant,
    updateCompanyAccountant,
    createCompanyDepartmentHead,
    updateCompanyDepartmentHead,
    createCompanyEmployee,
    updateCompanyEmployee,
};