/* eslint-disable @typescript-eslint/no-explicit-any */
import { v2 as cloudinary } from "cloudinary";
import { envVars } from "../utils/env";
import multer from "multer";

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
            public_id: uniqueName,
            folder: `zentro-hr-payroll-sass/${folder}`,
        },
            (error, result) => {
                if (error) {
                    console.error("Error uploading file to Cloudinary:", error);
                    return reject(error);
                }
                resolve(result);
            }
        ).end(buffer);
    });
}

export const deleteFileFromCloudinary = async (url: string) => {
    try {
        // Captures everything after /upload/v<version>/ up to the file extension
        // This correctly includes folder paths in the public_id
        const regex = /\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/;
        const match = url.match(regex);

        if (match && match[1]) {
            const publicId = match[1]; // e.g. zentro-hr-payroll-sass/images/y4rwn6wu328-...-unsplash
            const extension = url.split(".").pop()?.toLowerCase();
            const resourceType = extension === "pdf" ? "raw" : "image";

            const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
            console.log("Cloudinary delete result:", result); // check: should be { result: "ok" }
        } else {
            console.warn("Could not parse public ID from URL:", url);
        }
    } catch (error: any) {
        console.log("error from deleting file from cloudinary:", error);
    }
};

export const cloudinaryUpload = cloudinary;

export const multerUploadService = multer({ storage: multer.memoryStorage() });