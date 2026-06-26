import { DesignationWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreateDesignationPayload, IGetCompanyDesignationPayload, IUpdateDesignationPayload } from "./designation.interface";

const getCompanyAllOrQueryDesignationFromDB = async (companyId: string, payload: IGetCompanyDesignationPayload) => {
    const { search, page, limit, skip, sortBy, sortOrder } = payload;

    const addCondition: DesignationWhereInput[] = [];

    if (search) {
        addCondition.push({
            OR: [
                {
                    title: {
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

    const designations = await prisma.designation.findMany({
        where: {
            companyId: companyId,
            AND: addCondition
        },
        skip: skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const designationCount = await prisma.designation.count({
        where: {
            companyId: companyId,
            AND: addCondition
        }
    });

    return {
        data: designations,
        pagination: {
            total: designationCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(designationCount / limit),
        }
    }
};

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
    getCompanyAllOrQueryDesignationFromDB,
    createDesignationInDB,
    updateDesignationInDB,
    deleteDesignationInDB,
}