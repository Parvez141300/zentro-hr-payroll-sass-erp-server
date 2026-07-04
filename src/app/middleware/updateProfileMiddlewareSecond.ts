/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import { uploadFileToCloudinary } from "../config/cloudinary.utils";

export const updateProfileMiddlewareSecond = async (req: Request, res: Response, next: NextFunction) => {
    if (req.body.data) {
        req.body = JSON.parse(req.body.data);
    }

    const payload = req.body;

    const file = req.file;

    console.log("this is from postman file", req.file);

    if (file) {
        const result = await uploadFileToCloudinary(file.buffer, file.originalname);
        const photoUrl = await (result as any).secure_url;
        payload.info = { ...payload.info, photoUrl: photoUrl };
    }

    req.body = payload.info;

    console.log(req.body);

    next();
};