import { Role, SubscriptionPlan, SubscriptionStatus } from "../../../generated/prisma/enums";
import { CompanyWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma"
import { envVars } from "../../utils/env";
import { sendEmail } from "../../utils/sendEmail";
import { IGetCompanyPayload, IUpdateCompanyPayload } from "./company.interface"


const getAllOrQueryCompaniesFromDB = async (payload: IGetCompanyPayload) => {
    const { search, subscriptionPlan, subscriptionStatus, isDeleted, page, limit, skip, sortBy, sortOrder } = payload;

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
            isDeleted: isDeleted,
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
            isDeleted: isDeleted,
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

const getSingleCompanyFromDB = async (id: string) => {
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

const getUserOwnCompanyFromDB = async (companyId: string) => {
    const company = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!company) {
        throw new Error("Company not found");
    }

    return company;
}

const updateOwnCompanyInDB = async (companyId: string, payload: IUpdateCompanyPayload) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company does not exist!");
    }

    const company = await prisma.company.update({
        where: {
            id: companyId,
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

const cancelCompanySubscriptionInDB = async () => {
    const today = new Date();
    let totalProcessed = 0;
    let totalFailed = 0;

    // batch loop — একবারে সব লোড না করে 100 করে
    while (true) {
        const expiredCompanies = await prisma.company.findMany({
            where: {
                isDeleted: false,                                     // ✅ soft-deleted বাদ
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                subscriptionExpiry: { lte: today },
                NOT: { subscriptionPlan: SubscriptionPlan.FREE },
            },
            take: 100,
            select: {
                id: true,
                name: true,
                email: true,
                subscriptionPlan: true,
                subscriptionExpiry: true,
                users: {
                    where: { role: Role.Super_ADMIN },  // ⚠️ spelling যাচাই করো
                    select: { email: true },
                    take: 1,
                },
            },
        });

        if (expiredCompanies.length === 0) break;

        for (const company of expiredCompanies) {
            try {
                // ── DB transaction: atomic ──
                await prisma.$transaction(async (tx) => {
                    await tx.company.update({
                        where: { id: company.id },
                        data: {
                            subscriptionStatus: SubscriptionStatus.EXPIRED,
                            subscriptionPlan: SubscriptionPlan.FREE,
                            subscriptionExpiry: null,                       // ✅ stale date clear
                            maxEmployees: 10,
                            stripeSubscriptionId: null,
                        },
                    });

                    await tx.subscriptionHistory.create({
                        data: {
                            companyId: company.id,
                            plan: SubscriptionPlan.FREE,
                            status: SubscriptionStatus.EXPIRED,
                            startDate: new Date(),                          // ✅ এখন
                            endDate: new Date("2099-12-31"),
                        },
                    });
                });

                totalProcessed++;

                // ── Email: transaction-এর বাইরে, isolated ──
                await sendEmail({
                    to: company.users[0]?.email ?? company.email,       // ✅ safe fallback
                    subject: "Subscription Expired",
                    templateName: "expiration",
                    templateData: {
                        name: company.name,
                        subscriptionPlan: company.subscriptionPlan,
                        subscriptionStatus: SubscriptionStatus.EXPIRED,
                        subscriptionExpiry: company.subscriptionExpiry?.toLocaleDateString(
                            "en-GB",
                            { day: "2-digit", month: "long", year: "numeric" }
                        ),
                        renewSubscriptionUrl: `${envVars.FRONTEND_URL}/dashboard/subscription`,
                    },
                }).catch((err) => {
                    console.error(`Email failed for company ${company.id}`, err);
                });
            } catch (err) {
                totalFailed++;
                console.error(`Failed to expire company ${company.id}`, err);
            }
        }

        if (expiredCompanies.length < 100) break;
    }

    return { totalProcessed, totalFailed };
};

export const companyService = {
    getAllOrQueryCompaniesFromDB,
    getSingleCompanyFromDB,
    updateOwnCompanyInDB,
    softDeleteCompany,
    deleteCompany,
    cancelCompanySubscriptionInDB,
    getUserOwnCompanyFromDB,
}