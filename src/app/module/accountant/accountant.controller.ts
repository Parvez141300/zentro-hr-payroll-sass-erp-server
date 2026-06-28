import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { accountantService } from "./accountant.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";


const updateCompanyAccountant = catchAsync(async (req: Request, res: Response) => {
    const { id: accountantId } = req.params;
    const payload = req.body;
    const user = req.user;
    const role = user.role as Role;
    const result = await accountantService.updateCompanyAccountantInDB(user.companyId, accountantId as string, role, payload);
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
    updateCompanyAccountant,
    deleteCompanyAccountant,
};