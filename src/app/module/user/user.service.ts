import { HrScope, Role } from "../../../generated/prisma/enums";
import { UserWhereInput } from "../../../generated/prisma/models";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateCompanyAccountantPayload, ICreateCompanyDepartmentHeadPayload, ICreateCompanyEmployeePayload, ICreateHRManagerPayload, IGetAllOrQueryUsersPayload } from "./user.interface";
import { generateEmployeeCode } from "./user.utils";

const getAllOrQueryCompanyUsersFromDB = async (companyId: string, payload: IGetAllOrQueryUsersPayload) => {
    const { search, page, limit, skip, sortBy, sortOrder, isActive, role } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const addCondition: UserWhereInput[] = [];

    if(search) {
        addCondition.push({
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
                {
                    email: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        });
    }

    if(isActive) {
        addCondition.push({
            isActive: isActive
        });
    }

    if(role) {
        addCondition.push({
            role: role
        });
    }

    const users = await prisma.user.findMany({
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

    const userCount = await prisma.user.count({
        where: {
            companyId: companyId,
            AND: addCondition
        }
    });

    return {
        data: users,
        pagination: {
            total: userCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(userCount / limit),
        }
    }
}

const getSingleCompanyUserFromDB = async (companyId: string, userId: string) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
            companyId: companyId
        },
        include: {
            superAdmin: true,
            company: true,
            hrManager: true,
            accountant: true,
            departmentHead: true,
            employee: true,
        }
    });

    if (!user) {
        throw new Error("User not found");
    }

    return user;
}

const createCompanyHrInDB = async (companyId: string, payload: ICreateHRManagerPayload) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });

    if (isExistUser) {
        throw new Error(`User with email ${payload.email} already exist`);
    }

    if (payload.scope === HrScope.DEPARTMENT_SPECIFIC && !payload.departmentId && !payload.designationId) {
        throw new Error("Department ID and Designation ID is required for department-specific HR Manager");
    }

    if (payload.departmentId) {
        const isExistDepartment = await prisma.department.findUnique({
            where: {
                companyId: companyId,
                id: payload.departmentId
            }
        });

        if (!isExistDepartment) {
            throw new Error("Department not found in you company");
        }
    }

    if (payload.designationId) {
        const isExistDesignation = await prisma.designation.findUnique({
            where: {
                companyId: companyId,
                id: payload.designationId
            }
        });

        if (!isExistDesignation) {
            throw new Error("Designation not found in you company");
        }
    }

    // If scope is COMPANY_WIDE, departmentId and designationId must be null
    if (payload.scope === HrScope.COMPANY_WIDE && payload.departmentId && payload.designationId) {
        throw new Error("Department ID and Designation ID must be null for company-wide HR Manager");
    }

    const registerHr = await auth.api.signUpEmail({
        body: {
            companyId: companyId,
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: Role.HR_MANAGER,
        }
    });

    if (!registerHr.user.id) {
        throw new Error("User not created");
    }

    const employeeCode = await generateEmployeeCode(Role.HR_MANAGER, companyId)

    await prisma.$transaction(async (tx) => {
        await tx.hrManager.create({
            data: {
                userId: registerHr.user.id,
                companyId: companyId,
                departmentId: payload.departmentId || null,
                designationId: payload.designationId || null,
                name: payload.name,
                phone: payload.phone || null,
                photoUrl: payload.photoUrl || null,
                employeeCode: employeeCode || null,
                joinDate: payload.joinDate || null,
                hrLicenseNumber: payload.hrLicenseNumber || null,
                officePhone: payload.officePhone || null,
                bio: payload.bio || null,
                scope: payload.scope,
            }
        });

        await tx.user.update({
            where: {
                id: registerHr.user.id
            },
            data: {
                image: payload.photoUrl || null,
                emailVerified: true,
            }
        });
    });

    return registerHr;
};

const createCompanyAccountantInDB = async (companyId: string, payload: ICreateCompanyAccountantPayload) => {

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });

    if (isExistUser) {
        throw new Error(`User with email ${payload.email} already exist`);
    }

    const registerAccountant = await auth.api.signUpEmail({
        body: {
            companyId: companyId,
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: Role.ACCOUNTANT,
        }
    });

    if (!registerAccountant.user.id) {
        throw new Error("User not created");
    }

    const employeeCode = await generateEmployeeCode(Role.ACCOUNTANT, companyId)

    await prisma.$transaction(async (tx) => {
        await tx.accountant.create({
            data: {
                userId: registerAccountant.user.id,
                companyId: companyId,
                name: payload.name,
                phone: payload.phone || null,
                photoUrl: payload.photoUrl || null,
                employeeCode: employeeCode || null,
                joinDate: payload.joinDate || null,
                caLicenseNumber: payload.caLicenseNumber || null,
                taxIdNumber: payload.taxIdNumber || null,
                bankName: payload.bankName || null,
                bankAccount: payload.bankAccount || null,
            }
        });

        await tx.user.update({
            where: {
                id: registerAccountant.user.id
            },
            data: {
                image: payload.photoUrl || null,
                emailVerified: true,
            }
        });
    })

    return registerAccountant;
};

const createCompanyDepartmentHeadInDB = async (companyId: string, payload: ICreateCompanyDepartmentHeadPayload) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });

    if (isExistUser) {
        throw new Error(`User with email ${payload.email} already exist`);
    }

    const registerDepartmentHead = await auth.api.signUpEmail({
        body: {
            companyId: companyId,
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: Role.DEPARTMENT_HEAD,
        }
    });

    if (!registerDepartmentHead.user.id) {
        throw new Error("User not created");
    }

    const employeeCode = await generateEmployeeCode(Role.DEPARTMENT_HEAD, companyId);

    await prisma.$transaction(async (tx) => {
        await tx.departmentHead.create({
            data: {
                userId: registerDepartmentHead.user.id,
                companyId: companyId,
                departmentId: payload.departmentId,
                designationId: payload.designationId,
                name: payload.name,
                phone: payload.phone || null,
                photoUrl: payload.photoUrl || null,
                employeeCode: employeeCode || null,
                joinDate: payload.joinDate || null,
                officeLocation: payload.officeLocation || null,
                linkedinUrl: payload.linkedinUrl || null,
                bio: payload.bio || null,
            }
        });

        await tx.user.update({
            where: {
                id: registerDepartmentHead.user.id
            },
            data: {
                image: payload.photoUrl || null,
                emailVerified: true,
            }
        });
    });

    return registerDepartmentHead;
};


const createCompanyEmployeeInDB = async (companyId: string, payload: ICreateCompanyEmployeePayload) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistUser = await prisma.user.findUnique({
        where: {
            email: payload.email
        }
    });

    if (isExistUser) {
        throw new Error(`User with email ${payload.email} already exist`);
    }

    const registerEmployee = await auth.api.signUpEmail({
        body: {
            companyId: companyId,
            name: payload.name,
            email: payload.email,
            password: payload.password,
            role: Role.EMPLOYEE,
        }
    });

    if (!registerEmployee.user.id) {
        throw new Error("User not created");
    }

    const employeeCode = await generateEmployeeCode(Role.EMPLOYEE, companyId);

    await prisma.$transaction(async (tx) => {
        await tx.employee.create({
            data: {
                userId: registerEmployee.user.id,
                companyId: companyId,
                departmentId: payload.departmentId,
                designationId: payload.designationId,

                name: payload.name,
                phone: payload.phone || null,
                photoUrl: payload.photoUrl || null,
                dateOfBirth: payload.dateOfBirth || null,
                gender: payload.gender,
                address: payload.address || null,
                nidNumber: payload.nidNumber || null,
                bloodGroup: payload.bloodGroup || null,
                employeeCode: employeeCode,
                joinDate: payload.joinDate || null,

                employmentType: payload.employmentType,

                basicSalary: payload.basicSalary,
                houseAllowance: payload.houseAllowance || 0,
                medicalAllowance: payload.medicalAllowance || 0,
                transportAllowance: payload.transportAllowance || 0,

                bankName: payload.bankName || null,
                bankAccount: payload.bankAccount || null,

                emergencyName: payload.emergencyName || null,
                emergencyPhone: payload.emergencyPhone || null,
                emergencyRelation: payload.emergencyRelation || null,
            }
        });

        await tx.user.update({
            where: {
                id: registerEmployee.user.id
            },
            data: {
                image: payload.photoUrl || null,
                emailVerified: true,
            }
        });
    });

    return registerEmployee;
}


export const userService = {
    createCompanyHrInDB,
    createCompanyAccountantInDB,
    createCompanyDepartmentHeadInDB,
    createCompanyEmployeeInDB,
    getAllOrQueryCompanyUsersFromDB,
    getSingleCompanyUserFromDB,
}