import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { sslCommerzService } from "./sslCommerz.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const initiateSSLCommerzPayment = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;

    const result = await sslCommerzService.initiateSSLCommerzPaymentInDB({ companyId: user.companyId, userId: user.userId, planName: payload.planName });

    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "SSLCommerz payment initiated successfully",
        data: result,
    });
});

const handleSSLCommerzSuccess = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await sslCommerzService.handleSSLCommerzSuccessInDB(payload);

    res.redirect(result.message);
});

const handleSSLCommerzFail = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await sslCommerzService.handleSSLCommerzFailInDB(payload);

    res.redirect(result.message);
});

const handleSSLCommerzCancel = catchAsync(async (req: Request, res: Response) => {
    const payload = req.body;

    const result = await sslCommerzService.handleSSLCommerzCancelInDB(payload);

    res.redirect(result.message);
});

export const sslCommerzController = {
    initiateSSLCommerzPayment,
    handleSSLCommerzSuccess,
    handleSSLCommerzFail,
    handleSSLCommerzCancel,
};