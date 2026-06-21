import { SubscriptionPlan, SubscriptionStatus } from "../../../generated/prisma/enums";
import { CompanyWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"
import { ICreateCompanyPayload, IGetCompanyPayload, IUpdateCompanyPayload } from "./company.interface"


const getAllOrQueryCompaniesFromDB = async (payload: IGetCompanyPayload) => {
    const { search, subscriptionPlan, subscriptionStatus, page, limit, skip, sortBy, sortOrder } = payload;

    const addCondition: CompanyWhereInput[] = [];

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
                    email: {
                        contains: search,
                        mode: "insensitive"
                    }
                }
            ]
        });
    }

    if (subscriptionPlan) {
        addCondition.push({
            subscriptionPlan: subscriptionPlan as SubscriptionPlan,
        });
    }

    if (subscriptionStatus) {
        addCondition.push({
            subscriptionStatus: subscriptionStatus as SubscriptionStatus,
        });
    }

    const companies = await prisma.company.findMany({
        where: {
            AND: addCondition,
            isDeleted: false,
        },
        take: limit,
        skip: skip,
        orderBy: {
            [sortBy]: sortOrder,
        }
    });

    const totalCompanies = await prisma.company.count({
        where: {
            AND: addCondition,
            isDeleted: false,
        }
    });

    return {
        data: companies,
        pagination: {
            total: totalCompanies,
            currentPage: page,
            limit: limit,
            totalPages: Math.ceil(totalCompanies / limit),
        }
    };
}

const getCompanyFromDB = async (id: string) => {
    const company = await prisma.company.findUnique({
        where: {
            id
        }
    });

    if (!company) {
        throw new Error("Company not found");
    }

    return company;
}

const createCompanyInDB = async (payload: ICreateCompanyPayload) => {
    const company = await prisma.company.create({
        data: {
            ...payload
        }
    });

    return company;
}

const updateCompanyInDB = async (id: string, payload: IUpdateCompanyPayload) => {
    const company = await prisma.company.update({
        where: {
            id
        },
        data: {
            ...payload
        }
    });

    return company;
}

const softDeleteCompany = async (id: string) => {
    const company = await prisma.company.update({
        where: {
            id
        },
        data: {
            isDeleted: true,
        }
    });

    return company;
}

const deleteCompany = async (id: string) => {
    const company = await prisma.company.delete({
        where: {
            id
        }
    });

    return company;
}

export const companyService = {
    getAllOrQueryCompaniesFromDB,
    getCompanyFromDB,
    createCompanyInDB,
    updateCompanyInDB,
    softDeleteCompany,
    deleteCompany,
}