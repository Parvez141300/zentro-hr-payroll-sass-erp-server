/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from "cloudinary";
import { envVars } from "../utils/env";

cloudinary.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

export const uploadFileToCloudinary = async (buffer: Buffer, fileName: string) => {
    if (!buffer && !fileName) {
        throw new Error("File buffer and file name are required for uploading to cloudinary");
    }

    const extension = fileName.split(".").pop()?.toLocaleLowerCase();

    const fileNameWithoutExtension = fileName.split(".")
        .slice(0, -1)
        .join(".").
        toLocaleLowerCase()
        .replace(/\s+/g, "-")
        // eslint-disable-next-line no-useless-escape
        .replace(/[^a-z0-9\-]/g, ""); //my#file => my-file

    const uniqueName = Math.random().toString(36).substring(2) + "-" + Date.now() + "-" + fileNameWithoutExtension;

    const folder = extension === "pdf" ? "pdfs" : "images";

    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({
            resource_type: "auto",
            public_id: `cure-point-care/${folder}/${uniqueName}`,
            folder: `cure-point-care/${folder}`,
        },
            (error, result) => {
                if (error) {
                    return reject(error);
                }
                resolve(result);
            }
        ).end(buffer);
    });
}

export const deleteFileFromCloudinary = async (url: string) => {
    try {
        // eslint-disable-next-line no-useless-escape
        const regex = /\/([^\/]+)\.[a-zA-Z0-9]+$/;
        const match = url.match(regex);

        if (match && match[1]) {
            const publicId = match[1];
            await cloudinary.uploader.destroy(publicId, { resource_type: "image" });
            console.log(`File ${publicId} is deleted from cloudinary`);
        }
    } catch (error: any) {
        console.log('error from deleting file upload cloudinary: ', error);
        throw new Error("Failed to delete file from cloudinary", error.message);
    }
}

export const cloudinaryUpload = cloudinary;