import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { SubscriptionHistoryService } from "./subscriptionHistory.service";
import { Request, Response } from "express";

const getCompanySubscriptionHistory = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await SubscriptionHistoryService.getCompanySubscriptionHistoryFromDB(user.companyId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription history fetched successfully",
        data: result,
    })
});

export const subscriptionHistoryController = {
    getCompanySubscriptionHistory
}