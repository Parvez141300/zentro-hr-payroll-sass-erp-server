import cloudinary from "cloudinary";

export const uploadToCloudinary = async (buffer: Buffer, fileName: string) => {
    if (!buffer && !fileName) {
        throw new Error("Can not upload file to cloudinary because there is no file to upload");
    }

    const extension = fileName.split(".").pop()?.toLocaleLowerCase();
    const fileNameWithoutExtension = fileName.split(".").slice(0, -1).join(".");
    const uniqueName = Math.random().toString(36).substring(2) + fileNameWithoutExtension + "-" + Date.now();

    const folder = extension === "pdf" ? "pdfs" : "images";

    return new Promise((resolve, reject) => {
        cloudinary.v2.uploader.upload_stream(
            {
                folder: folder,
                public_id: uniqueName,
                resource_type: "auto"
            },
            (error, result) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(result);
                }
            }).end(buffer);
    });
};

export const deleteFileFromCloudinary = async (url: string) => {
    try {
        const regex = /\/([^/]+)$/;
        const fileName = url.match(regex)?.[1];
        if (fileName) {
            await cloudinary.v2.uploader.destroy(fileName)
                .then((result) => {
                    console.log(result);
                })
                .catch((error) => {
                    console.log("Error while deleting file from cloudinary", error);
                });
        }
    } catch (error) {
        console.log("Error while deleting file from cloudinary", error);
    }
}