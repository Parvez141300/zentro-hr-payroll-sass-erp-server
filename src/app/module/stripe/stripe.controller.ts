import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { stripeService } from "./stripe.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const signature = req.headers["stripe-signature"];
    const result = await stripeService.handleStripeWebhookInDB(payload, signature as string);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Stripe webhook handled successfully",
        data: result,
    });
});

export const stripeController = {
    handleStripeWebhook,
};