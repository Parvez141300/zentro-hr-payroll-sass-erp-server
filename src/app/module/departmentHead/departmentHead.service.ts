import { Role } from "../../../generated/prisma/enums";
import { DepartmentHeadWhereInput } from "../../../generated/prisma/models";
import { deleteFileFromCloudinary } from "../../config/cloudinary.utils";
import { prisma } from "../../lib/prisma";
import { IGetAllOrQueryDepartmentHeadPayload, IUpdateDepartmentHeadPayload } from "./departmentHead.interface";

const getAllOrQueryDepartmentHeadsFromDB = async (companyId: string, payload: IGetAllOrQueryDepartmentHeadPayload) => {
    const { search, page, limit, skip, sortBy, sortOrder } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const addCondition: DepartmentHeadWhereInput[] = [];

    if (search) {
        addCondition.push({
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    phone: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    employeeCode: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        });
    }

    const departmentHeads = await prisma.departmentHead.findMany({
        where: {
            companyId: companyId,
            AND: addCondition
        },
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const departmentHeadsCount = await prisma.departmentHead.count({
        where: {
            companyId: companyId,
            AND: addCondition
        }
    });

    return {
        data: departmentHeads,
        pagination: {
            total: departmentHeadsCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(departmentHeadsCount / limit),
        }
    }
}

const getDepartmentHeadOwnProfileFromDB = async (companyId: string, departmentHeadId: string) => {
    const isExistDepartmentHead = await prisma.departmentHead.findUnique({
        where: {
            companyId: companyId,
            id: departmentHeadId
        },
        include: {
            user: true,
        }
    });

    if (!isExistDepartmentHead) {
        throw new Error("Department head not found");
    }

    return isExistDepartmentHead;
}

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

        if (updateDepartmentHead.userId && isExistDepartmentHead.photoUrl) {
            await deleteFileFromCloudinary(isExistDepartmentHead.photoUrl);
        }

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

        if (updateDepartmentHead.userId && isExistDepartmentHead.photoUrl) {
            await deleteFileFromCloudinary(isExistDepartmentHead.photoUrl);
        }

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
    getAllOrQueryDepartmentHeadsFromDB,
    getDepartmentHeadOwnProfileFromDB,
    updateCompanyDepartmentHeadInDB,
    deleteDepartmentHeadFromDB,
}

