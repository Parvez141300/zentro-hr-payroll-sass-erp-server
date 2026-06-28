import { prisma } from "../../lib/prisma";
import { IUpdateAdminPayload } from "./admin.interface";

const updateCompanySuperAdminOwnProfileInDB = async (companyId: string, adminId: string, payload: IUpdateAdminPayload) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistAdmin = await prisma.user.findUnique({
        where: {
            id: adminId,
            companyId: companyId
        }
    });

    if (!isExistAdmin) {
        throw new Error("Admin not found");
    }

    const updateAdmin = await prisma.$transaction(async (tx) => {
        const uAdmin = await tx.superAdmin.update({
            where: {
                userId: adminId
            },
            data: {
                ...payload,
            }
        });

        await tx.user.update({
            where: {
                id: adminId
            },
            data: {
                name: payload.name || isExistAdmin.name,
                image: payload.photoUrl || isExistAdmin.image,
            }
        });

        return uAdmin;
    });

    return updateAdmin;
}

const updatePlatformSuperAdminProfileInDB = async (adminId: string, payload: IUpdateAdminPayload) => {

    const isExistAdmin = await prisma.user.findUnique({
        where: {
            id: adminId,
        }
    });

    if (!isExistAdmin) {
        throw new Error("Admin not found");
    }

    const updateAdmin = await prisma.$transaction(async (tx) => {
        const uAdmin = await tx.platformSuperAdmin.update({
            where: {
                userId: adminId
            },
            data: {
                ...payload,
            }
        });

        await tx.user.update({
            where: {
                id: adminId
            },
            data: {
                name: payload.name || isExistAdmin.name,
                image: payload.photoUrl || isExistAdmin.image,
            }
        });

        return uAdmin;
    });

    return updateAdmin;
}

const getCompanySuperAdminOwnProfileFromDB = async (companyId: string, adminId: string) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistAdmin = await prisma.user.findUnique({
        where: {
            id: adminId,
            companyId: companyId
        }
    });

    if (!isExistAdmin) {
        throw new Error("Admin not found");
    }

    const superAdmin = await prisma.superAdmin.findUnique({
        where: {
            userId: adminId,
            companyId: companyId,
        }
    });

    if (!superAdmin) {
        throw new Error("Super admin not found");
    }

    return superAdmin;
}

const getPlatformSuperAdminProfileFromDB = async (adminId: string) => {
    const isExistAdmin = await prisma.user.findUnique({
        where: {
            id: adminId,
        }
    });

    if (!isExistAdmin) {
        throw new Error("Platform Super admin does not exist");
    }

    const superAdmin = await prisma.platformSuperAdmin.findUnique({
        where: {
            userId: adminId,
        }
    });

    if (!superAdmin) {
        throw new Error("Platform Super admin not found");
    }

    return superAdmin;
}

export const adminService = {
    getCompanySuperAdminOwnProfileFromDB,
    getPlatformSuperAdminProfileFromDB,
    updateCompanySuperAdminOwnProfileInDB,
    updatePlatformSuperAdminProfileInDB,
}