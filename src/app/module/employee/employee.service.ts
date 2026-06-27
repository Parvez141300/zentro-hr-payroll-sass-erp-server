import { EmployeeWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGetAllOrQueryEmployeePayload } from "./employee.interface";

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

export const employeeService = {
    getAllOrQueryEmployeesFromDB,
};