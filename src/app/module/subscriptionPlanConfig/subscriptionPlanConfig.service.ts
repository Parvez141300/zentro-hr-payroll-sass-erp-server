import { Prisma } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { ISubscriptionPlanConfigPayload, IUpdateSubscriptionPlanConfigPayload } from "./subscriptionPlanConfig.interface";



const getAllSubscriptionPlanConfigFromDB = async () => {
    const subscriptionPlanConfig = await prisma.subscriptionPlanConfig.findMany();
    return subscriptionPlanConfig;
};

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

const updateSubscriptionPlanConfigInDB = async (id: string, payload: IUpdateSubscriptionPlanConfigPayload) => {

    const isExistSubscriptionPlanConfig = await prisma.subscriptionPlanConfig.findUnique({
        where: {
            id: id,
        },
    });

    if (!isExistSubscriptionPlanConfig) {
        throw new Error("Subscription plan config not found");
    }

    const featuresData = payload.features?.map((item) => (item as unknown as Prisma.InputJsonValue));

    const updateSubscriptionPlanConfig = await prisma.subscriptionPlanConfig.update({
        where: {
            id: id,
        },
        data: {
            ...payload,
            features: featuresData,
        }
    });

    return updateSubscriptionPlanConfig;
}

const deleteSubscriptionPlanConfigFromDB = async (id: string) => {

    const isExistSubscriptionPlanConfig = await prisma.subscriptionPlanConfig.findUnique({
        where: {
            id: id,
        },
    });

    if (!isExistSubscriptionPlanConfig) {
        throw new Error("Subscription plan config not found");
    }

    const subscriptionPlanConfig = await prisma.subscriptionPlanConfig.delete({
        where: {
            id: id,
        }
    });
    return subscriptionPlanConfig;
};

export const subscriptionPlanConfigService = {
    getAllSubscriptionPlanConfigFromDB,
    createSubscriptionPlanConfigInDB,
    updateSubscriptionPlanConfigInDB,
    deleteSubscriptionPlanConfigFromDB,
};