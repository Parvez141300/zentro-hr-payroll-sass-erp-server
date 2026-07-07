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

const cancelCompanySubscriptionInDB = async () => {
    const today = new Date();

    const expiredCompanies = await prisma.company.findMany({
        where: {
            subscriptionStatus: SubscriptionStatus.ACTIVE,
            subscriptionExpiry: {
                lte: today
            },
            NOT: {
                subscriptionPlan: SubscriptionPlan.FREE,
            }
        },
        include: {
            users: {
                where: {
                    role: Role.Super_ADMIN,
                },
                include: {
                    superAdmin: true,
                }
            },
        }
    });

    for (const company of expiredCompanies) {
        await prisma.$transaction(async (tx) => {
            await tx.company.update({
                where: {
                    id: company.id
                },
                data: {
                    subscriptionStatus: SubscriptionStatus.EXPIRED,
                    subscriptionPlan: SubscriptionPlan.FREE,
                    maxEmployees: 10,
                    stripeSubscriptionId: null,
                }
            });

            await tx.subscriptionHistory.create({
                data: {
                    companyId: company.id,
                    plan: SubscriptionPlan.FREE,
                    status: SubscriptionStatus.EXPIRED,
                    startDate: company.subscriptionExpiry || new Date(),
                    // FREE plan never expires
                    // No paymentId for automatic expiry
                    endDate: new Date('2099-12-31'),
                }
            });

            sendEmail({
                to: company.users[0].email || company.email,
                subject: "Subscription Expired",
                templateName: "expiration",
                templateData: {
                    name: company.name,
                    subscriptionPlan: company.subscriptionPlan,
                    subscriptionStatus: SubscriptionStatus.EXPIRED,
                    subscriptionExpiry: company.subscriptionExpiry?.toLocaleDateString(
                        "en-GB",
                        {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                        }
                    ),
                    renewSubscriptionUrl: `${envVars.FRONTEND_URL}/dashboard/subscription`
                }
            });
        });
    }
}

export const companyService = {
    getAllOrQueryCompaniesFromDB,
    getSingleCompanyFromDB,
    updateCompanyInDB,
    softDeleteCompany,
    deleteCompany,
    cancelCompanySubscriptionInDB,
}