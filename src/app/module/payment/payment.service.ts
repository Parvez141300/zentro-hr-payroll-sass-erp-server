import { SubscriptionPlan } from "../../../generated/prisma/enums";
import { PaymentWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGetCompanyPaymentsPayload } from "./payment.interface";

const getCompanyPaymentsFromDB = async (
    companyId: string,
    payload: IGetCompanyPaymentsPayload
) => {
    const { search, page, limit, skip, sortBy, sortOrder } = payload;

    // ✅ sort field whitelist (security)
    const ALLOWED_SORT_FIELDS = [
        "createdAt",
        "amountUSD",
        "status",
        "plan",
    ] as const;
    type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

    const safeSortBy: SortField = ALLOWED_SORT_FIELDS.includes(
        sortBy as SortField
    )
        ? (sortBy as SortField)
        : "createdAt";

    const safeSortOrder: "asc" | "desc" =
        sortOrder === "asc" || sortOrder === "desc" ? sortOrder : "desc";

    // ✅ build where clause
    const addCondition: PaymentWhereInput[] = [];
    const trimmedSearch = search?.trim();

    if (trimmedSearch) {
        // plan enum হলে partial match
        const matchedPlans = Object.values(SubscriptionPlan).filter((p) =>
            p.toLowerCase().includes(trimmedSearch.toLowerCase())
        );

        addCondition.push({
            plan: { in: matchedPlans },
        });
    }

    const where: PaymentWhereInput = {
        companyId,
        AND: addCondition,
    };

    // ✅ parallel query via $transaction
    const [payments, paymentCount] = await prisma.$transaction([
        prisma.payment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { [safeSortBy]: safeSortOrder },
        }),
        prisma.payment.count({ where }),
    ]);

    return {
        data: payments,
        pagination: {
            total: paymentCount,
            page,
            limit,
            totalPages: limit > 0 ? Math.ceil(paymentCount / limit) : 0,
        },
    };
};

export const paymentService = {
    getCompanyPaymentsFromDB,
};