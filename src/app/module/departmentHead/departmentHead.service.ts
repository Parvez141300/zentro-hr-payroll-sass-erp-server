import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUpdateDepartmentHeadPayload } from "./departmentHead.interface";

const updateCompanyDepartmentHeadInDB = async (companyId: string, departmentHeadId: string, role: Role, payload: IUpdateDepartmentHeadPayload) => {
    const isExistDepartmentHead = await prisma.departmentHead.findUnique({
        where: {
            companyId: companyId,
            id: departmentHeadId
        }
    });

    if (!isExistDepartmentHead) {
        throw new Error("Department head not found");
    }

    if (role === Role.Super_ADMIN) {
        const updateDepartmentHead = await prisma.$transaction(async (tx) => {
            const departmentHead = await tx.departmentHead.update({
                where: {
                    id: departmentHeadId
                },
                data: {
                    ...payload,
                }
            });

            const userData = await tx.user.findUnique({
                where: {
                    id: departmentHead.userId
                }
            });

            await tx.user.update({
                where: {
                    id: departmentHead.userId
                },
                data: {
                    name: payload.name || userData?.name,
                    image: payload.photoUrl || userData?.image,
                }
            });

            return departmentHead;
        });
        return updateDepartmentHead;
    }
    else {
        const updateDepartmentHead = await prisma.$transaction(async (tx) => {
            const departmentHead = await tx.departmentHead.update({
                where: {
                    id: departmentHeadId
                },
                data: {
                    name: payload.name || isExistDepartmentHead.name,
                    phone: payload.phone || isExistDepartmentHead.phone,
                    photoUrl: payload.photoUrl || isExistDepartmentHead.photoUrl,
                    officeLocation: payload.officeLocation || isExistDepartmentHead.officeLocation,
                    linkedinUrl: payload.linkedinUrl || isExistDepartmentHead.linkedinUrl,
                    bio: payload.bio || isExistDepartmentHead.bio,
                }
            });

            const userData = await tx.user.findUnique({
                where: {
                    id: departmentHead.userId
                }
            });

            await tx.user.update({
                where: {
                    id: departmentHead.userId
                },
                data: {
                    name: payload.name || userData?.name,
                    image: payload.photoUrl || userData?.image,
                }
            });

            return departmentHead;
        });
        return updateDepartmentHead;
    }
}

const deleteDepartmentHeadFromDB = async (companyId: string, departmentHeadId: string) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }
    
    const isExistDepartmentHead = await prisma.departmentHead.findUnique({
        where: {
            companyId: companyId,
            id: departmentHeadId
        }
    });

    if (!isExistDepartmentHead) {
        throw new Error("Department head not found");
    }

    const deleteDepartmentHead = await prisma.$transaction(async (tx) => {
        const dDepartmentHead = await tx.departmentHead.delete({
            where: {
                id: departmentHeadId
            }
        });

        await tx.user.delete({
            where: {
                id: dDepartmentHead.userId
            }
        });

        return dDepartmentHead;
    });

    return deleteDepartmentHead;
}

export const departmentHeadService = {
    updateCompanyDepartmentHeadInDB,
    deleteDepartmentHeadFromDB,
}

