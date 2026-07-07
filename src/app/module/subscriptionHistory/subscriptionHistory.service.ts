import { prisma } from "../../lib/prisma";

const getCompanySubscriptionHistoryFromDB = async (companyId: string) => {
    const subscriptionHistory = await prisma.subscriptionHistory.findMany({
        where: {
            companyId: companyId
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    return subscriptionHistory;
};

export const SubscriptionHistoryService = {
    getCompanySubscriptionHistoryFromDB,
};