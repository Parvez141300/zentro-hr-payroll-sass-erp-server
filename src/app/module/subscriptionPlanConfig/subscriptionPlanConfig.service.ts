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