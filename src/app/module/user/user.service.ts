import { HrScope, Role } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { ICreateCompanyAccountantPayload, ICreateCompanyDepartmentHeadPayload, ICreateHRManagerPayload } from "./user.interface";
import { generateEmployeeCode } from "./user.utils";

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

    await prisma.hrManager.create({
        data: {
            userId: registerHr.user.id,
            companyId: companyId,
            departmentId: payload.departmentId || null,
            designationId: payload.designationId || null,
            fullName: payload.name,
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

    await prisma.accountant.create({
        data: {
            userId: registerAccountant.user.id,
            companyId: companyId,
            fullName: payload.name,
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

    return;
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

    await prisma.departmentHead.create({
        data: {
            userId: registerDepartmentHead.user.id,
            companyId: companyId,
            departmentId: payload.departmentId,
            designationId: payload.designationId,
            fullName: payload.name,
            phone: payload.phone || null,
            photoUrl: payload.photoUrl || null,
            employeeCode: employeeCode || null,
            joinDate: payload.joinDate || null,
            officeLocation: payload.officeLocation || null,
            linkedinUrl: payload.linkedinUrl || null,
            bio: payload.bio || null,
        }
    });

    return registerDepartmentHead;
};

export const userService = {
    createCompanyHrInDB,
    createCompanyAccountantInDB,
    createCompanyDepartmentHeadInDB,
}