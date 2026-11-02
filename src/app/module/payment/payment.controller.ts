import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { paymentService } from "./payment.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";
import { paginationAndSortingHelper } from "../../utils/paginationAndSortingHelper";

const getCompanyPayments = catchAsync(async (req: Request, res: Response) => {
    const { companyId } = req.user;

    const search =
        typeof req.query.search === "string"
            ? req.query.search.trim()
            : undefined;

    const { page, limit, skip, sortBy, sortOrder } =
        paginationAndSortingHelper(req.query);

    const result = await paymentService.getCompanyPaymentsFromDB(companyId, {
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
        message: "Payments fetched successfully",
        data: result,
    });
});

export const paymentController = {
    getCompanyPayments,
};