import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { stripeService } from "./stripe.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const createStripeCheckoutSession = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await stripeService.createStripeCheckoutSessionInDB({
        userId: user.userId as string,
        companyId: user.companyId,
        ...payload,
    });
    sendResponse(res, {
        httpStatusCode: status.CREATED,
        success: true,
        message: "Stripe checkout session created successfully",
        data: result,
    });
});

const handleStripeWebhook = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;
    const signature = req.headers["stripe-signature"];
    if(!signature) {
        console.log("Stripe webhook signature not found");
        return res.status(status.BAD_REQUEST).json({message: "Stripe webhook signature not found"});
    }
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
    createStripeCheckoutSession,
};