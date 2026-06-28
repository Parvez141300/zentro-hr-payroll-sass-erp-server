import { Role } from "../../../generated/prisma/enums";
import { HrManagerWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGetAllOrQueryHRManagerPayload, IUpdateHRManagerPayload } from "./hrManager.interface";

const getAllOrQueryHrManagersFromDB = async (companyId: string, payload: IGetAllOrQueryHRManagerPayload) => {
    const {
        search,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const addCondition: HrManagerWhereInput[] = [
        {
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
                },
            ]
        }
    ];

    const hrManagers = await prisma.hrManager.findMany({
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

    const hrManagersCount = await prisma.hrManager.count({
        where: {
            companyId: companyId,
            AND: addCondition
        }
    });

    return {
        data: hrManagers,
        pagination: {
            total: hrManagersCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(hrManagersCount / limit),
        }
    }
}

const getHrManagerOwnProfileFromDB = async (companyId: string, userId: string) => {
    const hrManager = await prisma.hrManager.findUnique({
        where: {
            userId: userId,
            companyId: companyId,
        },
        include: {
            user: true,
        }
    });

    if (!hrManager) {
        throw new Error("HR Manager not found");
    }

    return hrManager;
}

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

const deleteCompanyHrFromDB = async (companyId: string, hrId: string) => {
    const isExistHr = await prisma.hrManager.findUnique({
        where: {
            companyId: companyId,
            id: hrId
        }
    });

    if (!isExistHr) {
        throw new Error("HR Manager not found");
    }

    const deleteHr = await prisma.$transaction(async (tx) => {
        const dHr = await tx.hrManager.delete({
            where: {
                id: hrId
            }
        });

        await tx.user.delete({
            where: {
                id: dHr.userId
            }
        });

        return dHr;
    });

    return deleteHr;
}

export const hrManagerService = {
    getAllOrQueryHrManagersFromDB,
    getHrManagerOwnProfileFromDB,
    updateCompanyHrInDB,
    deleteCompanyHrFromDB,
};