import { auth } from "../app/lib/auth";
import { prisma } from "../app/lib/prisma";
import { envVars } from "../app/utils/env";
import { Role } from "../generated/prisma/enums";

const seedPlatformSuperAdmin = async () => {
    const platformSuperAdminData = {
        name: envVars.PLATFORM_SUPER_ADMIN_NAME,
        email: envVars.PLATFORM_SUPER_ADMIN_EMAIL,
        role: Role.PLATFORM_SUPER_ADMIN,
        password: envVars.PLATFORM_SUPER_ADMIN_PASSWORD,
    }

    const isExistSuperAdmin = await prisma.user.findUnique({
        where: {
            email: platformSuperAdminData.email,
        }
    });

    if (isExistSuperAdmin) {
        throw new Error("Platform super admin already exist");
    }

    const platformSuperAdmin = await auth.api.signUpEmail({
        body: {
            name: platformSuperAdminData.name,
            email: platformSuperAdminData.email,
            password: platformSuperAdminData.password,
            role: platformSuperAdminData.role
        }
    });

    if (!platformSuperAdmin.user.id) {
        throw new Error("Platform super admin not created");
    }

    await prisma.$transaction(async (tx) => {
        await tx.user.update({
            where: {
                id: platformSuperAdmin.user.id,
            },
            data: {
                emailVerified: true,
            }
        });

        await tx.platformSuperAdmin.create({
            data: {
                userId: platformSuperAdmin.user.id,
                fullName: platformSuperAdmin.user.name,
                email: platformSuperAdmin.user.email,
            }
        });
    });

    console.log('super admin created: ', platformSuperAdmin.user);
    return platformSuperAdmin.user;
};

seedPlatformSuperAdmin();