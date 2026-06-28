import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { hrManagerService } from "./hrManager.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";


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

export const hrManagerController = {
    updateCompanyHr,
};