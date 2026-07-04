
import { NextFunction, Request, Response } from "express";

export const updateProfileMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }

        const payload = req.body;

        const files = req.files;

        console.log("this is from update profile middleware files is from postman:" , req.file);

        if (files && typeof files === 'object' && !Array.isArray(files) && files.file?.[0]) {
            if (!payload.info) {
                payload.info = {};
            }
            payload.info.photoUrl = files.file[0].path;
        }

        req.body = payload.info;

        console.log(req.body);

        next();
    } catch (error) {
        console.error("Middleware error:", error);
        next(error);
    }
};