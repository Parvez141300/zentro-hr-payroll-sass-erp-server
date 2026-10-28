import { DepartmentHead, HrManager } from "../../../generated/prisma/client";
import { HrScope, Role } from "../../../generated/prisma/enums";
import { EmployeeWhereInput } from "../../../generated/prisma/models";
import { deleteFileFromCloudinary } from "../../config/cloudinary.utils";
import { prisma } from "../../lib/prisma";
import { IGetAllOrQueryEmployeePayload, IUpdateEmployeePayload } from "./employee.interface";

const getAllOrQueryEmployeesFromDB = async (
    companyId: string,
    email: string | undefined,
    role: Role | undefined,
    payload: IGetAllOrQueryEmployeePayload
) => {
    const {
        search,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
        salaryType,
        employmentType,
        status,
        gender,
        departmentId,
        designationId,
    } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: { id: companyId },
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    // ✅ Shared include config — used by ALL branches
    const employeeInclude = {
        user: {
            include: {
                employee: {
                    include: {
                        attendances: true,
                    },
                },
            },
        },
        department: true,
        designation: true,
        company: true,
    } as const;

    const addCondition: EmployeeWhereInput[] = [];

    let departmentHeadData: DepartmentHead | null = null;
    let hrManagerData: HrManager | null = null;

    // Fetch role-specific data
    if (role === Role.DEPARTMENT_HEAD) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("Department head not found");

        departmentHeadData = await prisma.departmentHead.findUnique({
            where: { companyId, userId: user.id },
            include: {
                user: {
                    include: {
                        employee: {
                            include: { attendances: true },
                        },
                    },
                },
            },
        });
    }

    if (role === Role.HR_MANAGER) {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) throw new Error("HR Manager not found");

        hrManagerData = await prisma.hrManager.findUnique({
            where: { companyId, userId: user.id },
            include: {
                user: {
                    include: {
                        employee: {
                            include: { attendances: true },
                        },
                    },
                },
            },
        });
    }

    // Build filters
    if (search) {
        addCondition.push({
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { phone: { contains: search, mode: "insensitive" } },
                { employeeCode: { contains: search, mode: "insensitive" } },
            ],
        });
    }

    if (salaryType) addCondition.push({ salaryType });
    if (employmentType) addCondition.push({ employmentType });
    if (status) addCondition.push({ status });
    if (gender) addCondition.push({ gender });

    let employees;
    let employeeCount: number;

    // ✅ DEPARTMENT_HEAD — now includes attendances
    if (role === Role.DEPARTMENT_HEAD && departmentHeadData) {
        const where: EmployeeWhereInput = {
            companyId,
            AND: addCondition,
            departmentId: departmentHeadData.departmentId,
        };

        employees = await prisma.employee.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: employeeInclude,
        });

        employeeCount = await prisma.employee.count({ where });
    }
    // ✅ HR_MANAGER (department-specific) — now includes attendances
    else if (
        role === Role.HR_MANAGER &&
        hrManagerData?.scope === HrScope.DEPARTMENT_SPECIFIC &&
        hrManagerData?.departmentId
    ) {
        const where: EmployeeWhereInput = {
            companyId,
            AND: addCondition,
            departmentId: hrManagerData.departmentId,
        };

        employees = await prisma.employee.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: employeeInclude,
        });

        employeeCount = await prisma.employee.count({ where });
    }
    // ✅ else branch (Admin, HR company-wide, Employee-own) — includes attendances
    else {
        if (departmentId) addCondition.push({ departmentId });
        if (designationId) addCondition.push({ designationId });

        const where: EmployeeWhereInput = {
            companyId,
            AND: addCondition,
        };

        employees = await prisma.employee.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [sortBy]: sortOrder },
            include: employeeInclude,
        });

        employeeCount = await prisma.employee.count({ where });
    }

    return {
        data: employees,
        pagination: {
            total: employeeCount,
            page,
            limit,
            totalPages: Math.ceil(employeeCount / limit),
        },
    };
};

const getEmployeeOwnProfileFromDB = async (companyId: string, userId: string) => {
    const employee = await prisma.employee.findUnique({
        where: {
            userId: userId,
            companyId: companyId,
        },
        include: {
            user: true,
            company: true,
            department: true,
            designation: true,
        }
    });

    if (!employee) {
        throw new Error("Employee not found");
    }

    return employee;
}

const updateEmployeeInDB = async (companyId: string, userId: string, role: Role, payload: IUpdateEmployeePayload) => {
    const { name, phone, photoUrl, dateOfBirth, gender, address, nidNumber, bloodGroup, employmentType, basicSalary, houseAllowance, medicalAllowance, transportAllowance, bankName, bankAccount, emergencyName, emergencyPhone, emergencyRelation, departmentId, designationId, salaryType, workingDaysPerMonth } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const employeeData = await prisma.employee.findUnique({
        where: {
            userId: userId,
            companyId: companyId,
        }
    });

    if (!employeeData) {
        throw new Error("Employee not found");
    }

    if (role === Role.Super_ADMIN || role === Role.HR_MANAGER) {
        const updateEmployee = await prisma.$transaction(async (tx) => {
            const uEmployee = await tx.employee.update({
                where: {
                    userId: userId,
                    companyId: companyId,
                },
                data: {
                    name: name || employeeData.name,
                    phone: phone || employeeData.phone,
                    photoUrl: photoUrl || employeeData.photoUrl,
                    dateOfBirth: dateOfBirth || employeeData.dateOfBirth,
                    gender: gender || employeeData.gender,
                    address: address || employeeData.address,
                    nidNumber: nidNumber || employeeData.nidNumber,
                    bloodGroup: bloodGroup || employeeData.bloodGroup,
                    employmentType: employmentType || employeeData.employmentType,

                    salaryType: salaryType || employeeData.salaryType,
                    workingDaysPerMonth: workingDaysPerMonth || employeeData.workingDaysPerMonth,
                    basicSalary: basicSalary || employeeData.basicSalary,
                    houseAllowance: houseAllowance || employeeData.houseAllowance,
                    medicalAllowance: medicalAllowance || employeeData.medicalAllowance,
                    transportAllowance: transportAllowance || employeeData.transportAllowance,

                    bankName: bankName || employeeData.bankName,
                    bankAccount: bankAccount || employeeData.bankAccount,
                    emergencyName: emergencyName || employeeData.emergencyName,
                    emergencyPhone: emergencyPhone || employeeData.emergencyPhone,
                    emergencyRelation: emergencyRelation || employeeData.emergencyRelation,
                    departmentId: departmentId || employeeData.departmentId,
                    designationId: designationId || employeeData.designationId
                }
            });

            await tx.user.update({
                where: {
                    id: employeeData.userId,
                    companyId: companyId,
                },
                data: {
                    name: name || employeeData.name,
                    image: photoUrl || employeeData.photoUrl
                }
            });

            return uEmployee;
        });

        if (updateEmployee.userId && employeeData.photoUrl) {
            await deleteFileFromCloudinary(employeeData.photoUrl)
        }

        return updateEmployee;
    }

    if (role === Role.EMPLOYEE) {
        const updateEmployee = await prisma.$transaction(async (tx) => {
            const uEmployee = await tx.employee.update({
                where: {
                    userId: userId,
                    companyId: companyId,
                },
                data: {
                    name: name || employeeData.name,
                    phone: phone || employeeData.phone,
                    photoUrl: photoUrl || employeeData.photoUrl,
                    dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : employeeData.dateOfBirth || employeeData.dateOfBirth,
                    gender: gender || employeeData.gender,
                    address: address || employeeData.address,
                    nidNumber: nidNumber || employeeData.nidNumber,
                    bloodGroup: bloodGroup || employeeData.bloodGroup,
                    bankName: bankName || employeeData.bankName,
                    bankAccount: bankAccount || employeeData.bankAccount,
                    emergencyName: emergencyName || employeeData.emergencyName,
                    emergencyPhone: emergencyPhone || employeeData.emergencyPhone,
                    emergencyRelation: emergencyRelation || employeeData.emergencyRelation,
                }
            });

            await tx.user.update({
                where: {
                    id: employeeData.userId,
                    companyId: companyId,
                },
                data: {
                    name: name || employeeData.name,
                    image: photoUrl || employeeData.photoUrl
                }
            });

            return uEmployee;
        });

        if (updateEmployee.userId && employeeData.photoUrl) {
            await deleteFileFromCloudinary(employeeData.photoUrl)
        }

        return updateEmployee;
    }
}

const deleteEmployeeInDB = async (companyId: string, employeeId: string) => {

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistEmployee = await prisma.employee.findUnique({
        where: {
            id: employeeId,
            companyId: companyId,
        }
    });

    if (!isExistEmployee) {
        throw new Error("Employee not found");
    }

    const deleteEmployee = await prisma.$transaction(async (tx) => {
        const dEmployee = await tx.employee.delete({
            where: {
                id: employeeId,
                companyId: companyId,
            }
        });

        await tx.user.delete({
            where: {
                id: employeeId,
                companyId: companyId,
            }
        });

        return dEmployee;
    });

    return deleteEmployee;
}

export const employeeService = {
    getAllOrQueryEmployeesFromDB,
    getEmployeeOwnProfileFromDB,
    updateEmployeeInDB,
    deleteEmployeeInDB,
};