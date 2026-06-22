import { prisma } from "../../lib/prisma";
import { IDepartmentPayload } from "./department.interface";

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

export const departmentService = {
    createDepartmentInDB
}