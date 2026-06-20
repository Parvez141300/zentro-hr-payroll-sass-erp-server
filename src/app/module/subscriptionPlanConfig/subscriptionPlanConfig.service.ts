import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ISubscriptionPlanConfigPayload } from "./subscriptionPlanConfig.interface";

const createSubscriptionPlanConfigInDB = async (payload: ISubscriptionPlanConfigPayload) => {
    const { name, displayName, description, priceBDT, priceUSD, yearlyPriceBDT, yearlyPriceUSD, maxEmployees, features, isActive, sortOrder, popularBadge } = payload;

    const isExistSubscriptionPlanConfig = await prisma.subscriptionPlanConfig.findUnique(
        {
            where: { name }
        }
    );

    if (isExistSubscriptionPlanConfig) {
        throw new Error("This Subscription plan config already exist");
    }

    const subscriptionPlanConfig = await prisma.subscriptionPlanConfig.create({
        data: {
            name: name,
            displayName: displayName,
            description: description,
            priceBDT: priceBDT,
            priceUSD: priceUSD,
            yearlyPriceBDT: yearlyPriceBDT,
            yearlyPriceUSD: yearlyPriceUSD,
            maxEmployees: maxEmployees || 10,
            features: (features || []) as unknown as Prisma.InputJsonValue,
            isActive: isActive || true,
            sortOrder: sortOrder || 0,
            popularBadge: popularBadge || false,
        }
    });

    return subscriptionPlanConfig;
};

export const subscriptionPlanConfigService = {
    createSubscriptionPlanConfigInDB,
};