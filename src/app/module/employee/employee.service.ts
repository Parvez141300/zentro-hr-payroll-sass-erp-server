import { DepartmentHead, HrManager } from "../../../generated/prisma/client";
import { HrScope, Role } from "../../../generated/prisma/enums";
import { EmployeeWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGetAllOrQueryEmployeePayload, IUpdateEmployeePayload } from "./employee.interface";

const getAllOrQueryEmployeesFromDB = async (companyId: string, email: string | undefined, role: Role | undefined, payload: IGetAllOrQueryEmployeePayload) => {

    const { search, page, limit, skip, sortBy, sortOrder, employmentType, status, departmentId, designationId } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const addCondition: EmployeeWhereInput[] = [];

    let departmentHeadData: DepartmentHead | null = null;
    let hrManagerData: HrManager | null = null;

    if (role === Role.DEPARTMENT_HEAD) {
        const isExistsDepartmentHead = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!isExistsDepartmentHead) {
            throw new Error("Department head not found");
        }

        departmentHeadData = await prisma.departmentHead.findUnique({
            where: {
                companyId: companyId,
                userId: isExistsDepartmentHead.id
            }
        });
    }

    if (role === Role.HR_MANAGER) {
        const isExistsHrManager = await prisma.user.findUnique({
            where: {
                email: email
            }
        });

        if (!isExistsHrManager) {
            throw new Error("HR Manager not found");
        }

        hrManagerData = await prisma.hrManager.findUnique({
            where: {
                companyId: companyId,
                userId: isExistsHrManager.id
            }
        })
    }

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
                },
            ]
        });
    }

    if (employmentType) {
        addCondition.push({
            employmentType: employmentType
        });
    }

    if (status) {
        addCondition.push({
            status: status
        });
    }

    let employees;
    let employeeCount: number;

    if (role === Role.DEPARTMENT_HEAD && departmentHeadData) {
        employees = await prisma.employee.findMany({
            where: {
                companyId: companyId,
                AND: addCondition,
                departmentId: departmentHeadData?.departmentId,
            },
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                user: true,
            }
        });

        employeeCount = await prisma.employee.count({
            where: {
                companyId: companyId,
                AND: addCondition,
                departmentId: departmentHeadData?.departmentId,
            }
        });
    }
    else if (role === Role.HR_MANAGER && hrManagerData?.scope === HrScope.DEPARTMENT_SPECIFIC && hrManagerData?.departmentId) {
        employees = await prisma.employee.findMany({
            where: {
                companyId: companyId,
                AND: addCondition,
                departmentId: hrManagerData?.departmentId,
            },
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                user: true,
            }
        });

        employeeCount = await prisma.employee.count({
            where: {
                companyId: companyId,
                AND: addCondition,
                departmentId: hrManagerData?.departmentId,
            }
        });
    }
    else {
        if (departmentId) {
            addCondition.push({
                departmentId: departmentId
            });
        }

        if (designationId) {
            addCondition.push({
                designationId: designationId
            });
        }

        employees = await prisma.employee.findMany({
            where: {
                companyId: companyId,
                AND: addCondition,
            },
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                user: true,
            }
        });

        employeeCount = await prisma.employee.count({
            where: {
                companyId: companyId,
                AND: addCondition,
            }
        });
    }

    return {
        data: employees,
        pagination: {
            total: employeeCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(employeeCount / limit),
        }
    };
}

const getEmployeeOwnProfileFromDB = async (companyId: string, userId: string) => {
    const employee = await prisma.employee.findUnique({
        where: {
            userId: userId,
            companyId: companyId,
        },
        include: {
            user: true,
        }
    });

    if (!employee) {
        throw new Error("Employee not found");
    }

    return employee;
}

const updateEmployeeInDB = async (companyId: string, employeeId: string, role: Role, payload: IUpdateEmployeePayload) => {
    const { name, phone, photoUrl, dateOfBirth, gender, address, nidNumber, bloodGroup, employmentType, basicSalary, houseAllowance, medicalAllowance, transportAllowance, bankName, bankAccount, emergencyName, emergencyPhone, emergencyRelation, departmentId, designationId } = payload;

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
            id: employeeId,
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
                    id: employeeId,
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

        return updateEmployee;
    }

    if (role === Role.EMPLOYEE) {
        const updateEmployee = await prisma.$transaction(async (tx) => {
            const uEmployee = await tx.employee.update({
                where: {
                    id: employeeId,
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