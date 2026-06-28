import { Request, Response } from "express";
import { catchAsync } from "../../utils/catchAsync";
import { adminService } from "./admin.service";
import { sendResponse } from "../../utils/sendResponse";
import status from "http-status";

const updateCompanySuperAdminOwnProfile = catchAsync(async (req: Request, res: Response) => {
    const { id: adminId } = req.params;
    const user = req.user;
    const payload = req.body;
    const result = await adminService.updateCompanySuperAdminOwnProfileInDB(user.companyId, adminId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Admin profile updated successfully",
        data: result,
    });
});

const updatePlatformSuperAdminProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const payload = req.body;
    const result = await adminService.updatePlatformSuperAdminProfileInDB( user.userId as string, payload);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Admin profile updated successfully",
        data: result,
    });
});

const getCompanySuperAdminOwnProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await adminService.getCompanySuperAdminOwnProfileFromDB(user.companyId, user.userId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Admin profile fetched successfully",
        data: result,
    });
});

const getPlatformSuperAdminProfile = catchAsync(async (req: Request, res: Response) => {
    const user = req.user;
    const result = await adminService.getPlatformSuperAdminProfileFromDB(user.userId);
    sendResponse(res, {
        httpStatusCode: status.OK,
        success: true,
        message: "Admin profile fetched successfully",
        data: result,
    });
});

export const adminController = {
    updateCompanySuperAdminOwnProfile,
    getCompanySuperAdminOwnProfile,
    updatePlatformSuperAdminProfile,
    getPlatformSuperAdminProfile,
};