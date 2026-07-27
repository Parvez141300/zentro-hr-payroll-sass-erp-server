/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { uploadFileToCloudinary } from "../config/cloudinary.utils";

export const updateCompanyProfileMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
        req.body = JSON.parse(req.body.data);
    }

    const payload = req.body;

    // .fields() ব্যবহার করলে req.files একটা object হবে, key অনুযায়ী array
    const files = req.files as {
        logo?: Express.Multer.File[];
        banner?: Express.Multer.File[];
    };

    console.log("uploaded files", files);

    // Logo আপলোড হ্যান্ডল করুন
    if (files?.logo?.[0]) {
        const logoFile = files.logo[0];
        const result = await uploadFileToCloudinary(logoFile.buffer, logoFile.originalname);
        const logoUrl = (result as any).secure_url;
        payload.info = { ...payload.info, logoUrl };
    }

    // Banner আপলোড হ্যান্ডল করুন
    if (files?.banner && files.banner.length > 0) {
        const bannerUrls = await Promise.all(
            files.banner.map(async (bannerFile) => {
                const result = await uploadFileToCloudinary(bannerFile.buffer, bannerFile.originalname);
                return (result as any).secure_url;
            })
        );
        // একটাই banner হলে প্রথমটা নিন, একাধিক হলে array হিসেবে রাখুন —
        // আপনার schema অনুযায়ী ঠিক করুন
        payload.info = { ...payload.info, bannerUrl: bannerUrls[0] };
        // অথবা একাধিক banner সাপোর্ট করলে:
        // payload.info = { ...payload.info, bannerUrls };
    }

    req.body = payload.info;

    console.log(req.body);

    next();
};