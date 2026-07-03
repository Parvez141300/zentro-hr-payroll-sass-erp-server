import cloudinary from "cloudinary";
import { envVars } from "../utils/env";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

cloudinary.v2.config({
    cloud_name: envVars.CLOUDINARY.CLOUDINARY_CLOUD_NAME,
    api_key: envVars.CLOUDINARY.CLOUDINARY_API_KEY,
    api_secret: envVars.CLOUDINARY.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: async (req, file) => {
        const originalName = file.originalname;
        const extension = originalName.split(".").pop()?.toLocaleLowerCase();

        const fileNameWithoutExtension = originalName.split(".").slice(0, -1).join(".");
        const uniqueName = Math.random().toString(36).substring(2) + fileNameWithoutExtension + "-" + Date.now();

        const folder = extension === "pdf" ? "pdfs" : "images";

        return {
            folder: folder,
            public_id: uniqueName,
            resource_type: "auto",
        }
    }
});

export const multerUpload = multer({storage: storage});