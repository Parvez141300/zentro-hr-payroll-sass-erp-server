import { prisma } from "../../lib/prisma"
import { ICreateCompanyPayload } from "./company.interface"

const createCompanyInDB = async (payload: ICreateCompanyPayload) => {
    const company = await prisma.company.create({
        data: {
            ...payload
        }
    });

    return company;
}

export const companyService = {
    createCompanyInDB,
}