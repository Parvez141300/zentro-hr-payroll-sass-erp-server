import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { statsService } from "./stats.service";
import status from "http-status";
import { Role } from "../../../generated/prisma/enums";
import { sendResponse } from "../../utils/sendResponse";

const getDashboardStats = catchAsync(async (req: Request, res: Response) => {
    const {companyId, userId, role} = req.user;
    const queryPayload = req.query;
    const result = await statsService.getDashboardStatsFromDB(companyId, userId, role as Role, queryPayload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Dashboard stats fetched successfully",
        data: result,
    });
});

export const statsController = {
    getDashboardStats,
};