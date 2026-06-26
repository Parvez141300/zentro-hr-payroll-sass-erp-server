import { prisma } from "../../lib/prisma";
import { IDepartmentPayload, IUpdateDepartmentPayload } from "./department.interface";



const createDepartmentInDB = async (payload: IDepartmentPayload) => {
    const isExistDepartment = await prisma.department.findUnique({
        where: {
            name_companyId: {
                name: payload.name,
                companyId: payload.companyId,
            }
        }
    });

    if (isExistDepartment) {
        throw new Error("Department already exist");
    }

    const department = await prisma.department.create({
        data: {
            ...payload
        }
    });

    return department;
}

const updateDepartmentInDB = async (id: string, payload: IUpdateDepartmentPayload) => {
    const department = await prisma.department.update({
        where: {
            id
        },
        data: {
            ...payload
        }
    });

    return department;
}

export const departmentService = {
    createDepartmentInDB,
    updateDepartmentInDB,
}