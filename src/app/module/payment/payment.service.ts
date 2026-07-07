import { prisma } from "../../lib/prisma";

const getCompanyPaymentsFromDB = async (companyId: string) => {
    const result = await prisma.payment.findMany({ where: { companyId: companyId } });
    return result;
};

export const paymentService = { getCompanyPaymentsFromDB };