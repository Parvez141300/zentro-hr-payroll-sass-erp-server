import { Role } from "../../../generated/prisma/enums";
import { EmployeeWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGetAllOrQueryEmployeePayload, IUpdateEmployeePayload } from "./employee.interface";

const getAllOrQueryEmployeesFromDB = async (companyId: string, payload: IGetAllOrQueryEmployeePayload) => {

    const { search, page, limit, skip, sortBy, sortOrder, employmentType, status } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const addCondition: EmployeeWhereInput[] = [];

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
                        mode: "default"
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

    const employees = await prisma.employee.findMany({
        where: {
            companyId: companyId,
            AND: addCondition
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

    const employeeCount = await prisma.employee.count({
        where: {
            companyId: companyId,
            AND: addCondition
        }
    });

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

const updateEmployeeInDB = async (companyId: string, userId: string, role: Role, payload: IUpdateEmployeePayload) => {
    const {name, phone, photoUrl, dateOfBirth, gender, address, nidNumber, bloodGroup, employmentType, basicSalary, houseAllowance, medicalAllowance, transportAllowance, bankName, bankAccount, emergencyName, emergencyPhone, emergencyRelation} = payload;
    
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
            id: userId
        }
    });

    if (!isExistUser) {
        throw new Error(`This ${userId} user not found`);
    }

    const employeeData = await prisma.employee.findUnique({
        where: {
            id: userId,
            companyId: companyId,
        }
    });

    if (!employeeData) {
        throw new Error("Employee not found");
    }

    if(role === Role.Super_ADMIN || role === Role.HR_MANAGER) {
        const updateEmployee = await prisma.employee.update({
            where: {
                id: userId,
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
            }
        });

        return updateEmployee;
    }

    if(role === Role.EMPLOYEE) {
        const updateEmployee = await prisma.employee.update({
            where: {
                id: userId,
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

        return updateEmployee;
    }
}

export const employeeService = {
    getAllOrQueryEmployeesFromDB,
    updateEmployeeInDB,
};