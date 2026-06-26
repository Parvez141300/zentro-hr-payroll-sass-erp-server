import { DepartmentWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IDepartmentPayload, IGetCompanyDepartmentPayload, IUpdateDepartmentPayload } from "./department.interface";



const getAllCompanyDepartmentsFromDB = async (companyId: string, payload: IGetCompanyDepartmentPayload) => {
    const addCondition: DepartmentWhereInput[] = [];

    const { search, page, limit, skip, sortBy, sortOrder } = payload;

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
                    description: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        });
    }


    const departments = await prisma.department.findMany({
        where: {
            companyId: companyId,
            AND: addCondition,
        },
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        },
    });

    const departmentCount = await prisma.department.count({
        where: {
            companyId: companyId,
            AND: addCondition,
        },
    });

    return { 
        data: departments,
        pagination: {
            total: departmentCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(departmentCount / limit),
        }
    };
};

const createDepartmentInDB = async (companyId: string, payload: IDepartmentPayload) => {
    const isExistDepartment = await prisma.department.findUnique({
        where: {
            name_companyId: {
                name: payload.name,
                companyId: companyId,
            }
        }
    });

    if (isExistDepartment) {
        throw new Error("Department already exist");
    }

    const department = await prisma.department.create({
        data: {
            companyId: companyId,
            ...payload,
        }
    });

    return department;
};

const updateDepartmentInDB = async (id: string, payload: IUpdateDepartmentPayload) => {
    const department = await prisma.department.update({
        where: {
            id,
        },
        data: {
            ...payload
        }
    });

    return department;
};

export const departmentService = {
    getAllCompanyDepartmentsFromDB,
    createDepartmentInDB,
    updateDepartmentInDB,
}