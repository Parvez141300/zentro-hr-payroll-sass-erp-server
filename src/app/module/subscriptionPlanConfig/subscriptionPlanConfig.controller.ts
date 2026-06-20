import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { subscriptionPlanConfigService } from "./subscriptionPlanConfig.service";

const createSubscriptionPlanConfig = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const result = await subscriptionPlanConfigService.createSubscriptionPlanConfigInDB(payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription plan config created successfully",
        data: result,
    });
});

export const subscriptionPlanConfigController = {
    createSubscriptionPlanConfig,
};