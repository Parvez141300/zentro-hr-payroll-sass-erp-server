import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUpdateHRManagerPayload } from "./hrManager.interface";

const updateCompanyHrInDB = async (companyId: string, hrId: string, role: Role, payload: IUpdateHRManagerPayload) => {

    const isExistHr = await prisma.hrManager.findUnique({
        where: {
            companyId: companyId,
            id: hrId
        }
    });

    if (!isExistHr) {
        throw new Error("HR Manager not found");
    }

    if (role === Role.Super_ADMIN) {
        const updateHr = await prisma.$transaction(async (tx) => {
            const uHr = await tx.hrManager.update({
                where: {
                    id: hrId
                },
                data: {
                    ...payload,
                }
            });


            const userData = await tx.user.findUnique({
                where: {
                    id: uHr.userId
                }
            });

            await tx.user.update({
                where: {
                    id: uHr.userId
                },
                data: {
                    name: payload.name,
                    image: payload.photoUrl || userData?.image,
                }
            });

            return uHr;
        });

        return updateHr;
    }
    else {
        const updateHr = await prisma.$transaction(async (tx) => {
            const uHr = await tx.hrManager.update({
                where: {
                    id: hrId
                },
                data: {
                    name: payload.name,
                    photoUrl: payload.photoUrl,
                    phone: payload.phone,
                    bio: payload.bio,
                }
            });

            const userData = await tx.user.findUnique({
                where: {
                    id: uHr.userId
                }
            });

            await tx.user.update({
                where: {
                    id: uHr.userId
                },
                data: {
                    name: payload.name,
                    image: payload.photoUrl || userData?.image,
                }
            });

            return uHr;
        });

        return updateHr;
    }
}

export const hrManagerService = {
    updateCompanyHrInDB,
};