import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const getCompanyPayments = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;

    const result = await paymentService.getCompanyPaymentsFromDB(user.companyId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Company payments fetched successfully",
        data: result,
    });
});

export const paymentController = {
    getCompanyPayments,
};