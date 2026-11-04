import { Prisma, SubscriptionPlan } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { IGetAllSubscriptionPlanConfigPayload, ISubscriptionPlanConfigPayload, IUpdateSubscriptionPlanConfigPayload } from "./subscriptionPlanConfig.interface";



const getAllSubscriptionPlanConfigFromDB = async (
    payload: IGetAllSubscriptionPlanConfigPayload
) => {
    const {
        search,
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    } = payload;

    // ✅ Build the where clause
    const addCondition: Prisma.SubscriptionPlanConfigWhereInput[] = [];

    // ✅ Universal search — matches name OR displayName
    if (search) {
        const matchingEnums = Object.values(SubscriptionPlan).filter((plan) =>
            plan.toLowerCase().includes(search.toLowerCase())
        );

        addCondition.push({
            OR: [
                { name: { in: matchingEnums } },
                { displayName: { contains: search, mode: "insensitive" } },
            ],
        });
    }

    // ✅ Final where clause
    const where: Prisma.SubscriptionPlanConfigWhereInput = {
        AND: addCondition,
    };

    // ✅ Fetch with pagination, sorting, and count in parallel
    const [subscriptionPlanConfigs, total] = await Promise.all([
        prisma.subscriptionPlanConfig.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder,
            },
        }),
        prisma.subscriptionPlanConfig.count({ where }),
    ]);

    return {
        data: subscriptionPlanConfigs,
        pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
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

const mapFeaturesToJson = (
    features: IUpdateSubscriptionPlanConfigPayload["features"]
): Prisma.InputJsonValue[] | undefined => {
    if (features === undefined) return undefined;

    return features.map((f) => ({
        id: f.id,
        icon: f.icon,
        name: f.name,
        category: f.category,
        included: f.included,
        description: f.description,
    })) satisfies Prisma.InputJsonValue[];
};

const updateSubscriptionPlanConfigInDB = async (
    id: string,
    payload: IUpdateSubscriptionPlanConfigPayload
) => {
    if (!id) {
        throw new Error("Subscription plan config id is required");
    }

    const isExist = await prisma.subscriptionPlanConfig.findUnique({ where: { id } });
    if (!isExist) {
        throw new Error("Subscription plan config not found");
    }

    const {
        name, displayName, description,
        priceUSD, priceBDT,
        yearlyPriceUSD, yearlyPriceBDT,
        maxEmployees, isActive, sortOrder, popularBadge,
        features,
    } = payload;

    const featuresData = mapFeaturesToJson(features);

    return await prisma.subscriptionPlanConfig.update({
        where: { id },
        data: {
            ...(name !== undefined && { name }),
            ...(displayName !== undefined && { displayName }),
            ...(description !== undefined && { description }),
            ...(priceUSD !== undefined && { priceUSD }),
            ...(priceBDT !== undefined && { priceBDT }),
            ...(yearlyPriceUSD !== undefined && { yearlyPriceUSD }),
            ...(yearlyPriceBDT !== undefined && { yearlyPriceBDT }),
            ...(maxEmployees !== undefined && { maxEmployees }),
            ...(isActive !== undefined && { isActive }),
            ...(sortOrder !== undefined && { sortOrder }),
            ...(popularBadge !== undefined && { popularBadge }),
            ...(featuresData !== undefined && { features: featuresData }),
        },
    });
};

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