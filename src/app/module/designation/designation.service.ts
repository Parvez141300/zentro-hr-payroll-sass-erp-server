import { prisma } from "../../lib/prisma";
import { ICreateDesignationPayload } from "./designation.interface";

const createDesignationInDB = async (companyId: string, payload: ICreateDesignationPayload) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistDesignation = await prisma.designation.findUnique({
        where: {
            title_departmentId_companyId: {
                title: payload.title,
                departmentId: payload.departmentId,
                companyId: companyId
            }
        }
    });

    if (isExistDesignation) {
        throw new Error("Designation already exist");
    }

    const designation = await prisma.designation.create({
        data: {
            companyId: companyId,
            ...payload
        }
    });

    return designation;
}

export const designationService = {
    createDesignationInDB,
}