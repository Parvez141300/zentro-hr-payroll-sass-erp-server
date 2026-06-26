import { prisma } from "../../lib/prisma";
import { ICreateDesignationPayload, IUpdateDesignationPayload } from "./designation.interface";

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

const updateDesignationInDB = async (designationId: string, payload: IUpdateDesignationPayload) => {

    const updateDesignation = await prisma.designation.update({
        where: {
            id: designationId
        },
        data: {
            ...payload
        }
    });

    return updateDesignation;
}

const deleteDesignationInDB = async (designationId: string) => {
    const deleteDesignation = await prisma.designation.delete({
        where: {
            id: designationId,
        }
    });

    return deleteDesignation;
}

export const designationService = {
    createDesignationInDB,
    updateDesignationInDB,
    deleteDesignationInDB,
}