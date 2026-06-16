import { prisma } from "../../lib/prisma"
import { ICreateCompanyPayload, IUpdateCompanyPayload } from "./company.interface"


const getCompanyFromDB = async (id: string) => {
    const company = await prisma.company.findUnique({
        where: {
            id
        }
    });

    if(!company) {
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

export const companyService = {
    getCompanyFromDB,
    createCompanyInDB,
    updateCompanyInDB,
}