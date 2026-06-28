import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { departmentHeadService } from "./departmentHead.service";
import { Role } from "../../../generated/prisma/enums";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const updateCompanyDepartmentHead = catchAsync(async (req: Request, res: Response) => {
    const { id: departmentHeadId } = req.params;
    const payload = req.body;
    const user = req.user;
    const role = user.role as Role;
    const result = await departmentHeadService.updateCompanyDepartmentHeadInDB(user.companyId, departmentHeadId as string, role, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company department head updated successfully",
        data: result,
    });
});

const deleteCompanyDepartmentHead = catchAsync(async (req: Request, res: Response) => {
    const { id: departmentHeadId } = req.params;
    const user = req.user;
    const result = await departmentHeadService.deleteDepartmentHeadFromDB(user.companyId, departmentHeadId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company department head deleted successfully",
        data: result,
    });
});

export const departmentHeadController = {
    updateCompanyDepartmentHead,
    deleteCompanyDepartmentHead,
};