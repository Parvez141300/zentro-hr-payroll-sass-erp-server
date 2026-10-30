import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { subscriptionPlanConfigService } from "./subscriptionPlanConfig.service";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";

const getAllSubscriptionPlanConfig = catchAsync(
    async (req: Request, res: Response) => {
        // ✅ Parse filters from query
        const search =
            typeof req.query.search === "string" ? req.query.search : "";

        // ✅ Use the shared helper (same as employees)
        const { page, limit, skip, sortBy, sortOrder } =
            paginationAndSortingHelper(req.query);

        // ✅ Call service
        const result =
            await subscriptionPlanConfigService.getAllSubscriptionPlanConfigFromDB({
                search,
                page,
                limit,
                skip,
                sortBy,
                sortOrder,
            });

        sendResponse(res, {
            httpStatusCode: status.OK,
            success: true,
            message: "Subscription plan config fetched successfully",
            data: result,
        });
    }
);

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

const updateSubscriptionPlanConfig = catchAsync(async (req: Request, res: Response) => {
    const { id: subscriptionPlanConfigId } = req.params;
    const payload = req.body;
    const result = await subscriptionPlanConfigService.updateSubscriptionPlanConfigInDB(subscriptionPlanConfigId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription plan config updated successfully",
        data: result,
    });
});

const deleteSubscriptionPlanConfig = catchAsync(async (req: Request, res: Response) => {
    const { id: subscriptionPlanConfigId } = req.params;
    const result = await subscriptionPlanConfigService.deleteSubscriptionPlanConfigFromDB(subscriptionPlanConfigId as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Subscription plan config deleted successfully",
        data: result,
    });
});

export const subscriptionPlanConfigController = {
    getAllSubscriptionPlanConfig,
    createSubscriptionPlanConfig,
    updateSubscriptionPlanConfig,
    deleteSubscriptionPlanConfig,
};