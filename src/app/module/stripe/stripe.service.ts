import { PaymentGateway, PaymentStatus, SubscriptionPlan } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../utils/env";
import { ICreateStripeCheckoutSessionPayload } from "./stripe.interface";
import Stripe from "stripe";

const stripe = new Stripe(envVars.STRIPE.STRIPE_SECRET_KEY);

const createStripeCheckoutSessionInDB = async (payload: ICreateStripeCheckoutSessionPayload) => {
    const { companyId, userId, planName, successUrl, cancelUrl } = payload;

    // validation check
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId,
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found for create stripe checkout session");
    }

    const isExistUser = await prisma.user.findUnique({
        where: {
            id: userId,
            companyId: companyId,
        }
    });

    if (!isExistUser) {
        throw new Error("User not found for create stripe checkout session");
    }

    const isExistsSubscriptionPlanConfig = await prisma.subscriptionPlanConfig.findUnique({
        where: {
            name: planName as SubscriptionPlan,
        }
    });

    if (!isExistsSubscriptionPlanConfig) {
        throw new Error("Subscription plan config not found for create stripe checkout session");
    }

    // create payment record (pending)
    const payment = await prisma.payment.create({
        data: {
            companyId: isExistCompany.id,
            gateway: PaymentGateway.STRIPE,
            plan: planName as SubscriptionPlan,
            amountUSD: isExistsSubscriptionPlanConfig.priceUSD,
            status: PaymentStatus.PENDING,
            transactionId: `txn-${Date.now()}-${isExistCompany.id}`,
        }
    });

    // if company customerId not exist then create 
    let customerId = isExistCompany.stripeCustomerId;
    if (!customerId) {
        const customer = await stripe.customers.create({
            name: isExistUser.name,
            email: isExistCompany.email || isExistUser.email,
            metadata: {
                userId: isExistUser.id,
                companyId: isExistCompany.id,
                companyName: isExistCompany.name,
                paymentId: payment.id,
            }
        });

        customerId = customer.id;

        await prisma.company.update({
            where: {
                id: isExistCompany.id,
            },
            data: {
                stripeCustomerId: customerId,
            }
        });
    }

    // create stripe checkout session
    const session = await stripe.checkout.sessions.create({
        customer: customerId,
        line_items: [
            {
                price_data: {
                    currency: "usd",
                    unit_amount: Math.round(isExistsSubscriptionPlanConfig.priceUSD * 100), // cents
                    recurring: { interval: "month" },
                    product_data: { 
                        name: `Zentro ${isExistsSubscriptionPlanConfig.name} Plan` 
                    },
                },
                quantity: 1,
            },
        ],
        mode: "subscription",
        success_url: successUrl || `${envVars.FRONTEND_URL}/dashboard/settings/billing?payment=success&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: cancelUrl || `${envVars.FRONTEND_URL}/dashboard/settings/billing?payment=cancel`,
        metadata: {
            userId: isExistUser.id,
            companyId: isExistCompany.id,
            companyName: isExistCompany.name,
            paymentId: payment.id,
        },
    });

    // update payment with stripe checkout session id
    await prisma.payment.update({
        where: {
            id: payment.id,
        },
        data: {
            stripePaymentIntentId: session.payment_intent as string,
            stripeSubscriptionId: session.subscription as string,
        }
    });
    // update company with stripe subscription id
    await prisma.company.update({
        where: {
            id: isExistCompany.id,
        },
        data: {
            stripeSubscriptionId: session.subscription as string,
        }
    });

    return {
        sessionId: session.id,
        paymentId: payment.id,
        url: session.url,
    };
};

const handleStripeWebhookInDB = async (payload: Record<string, unknown>, signature: string) => {
    console.log(payload, signature, "this is from the stripe webhook");
    return true;
};

export const stripeService = {
    handleStripeWebhookInDB,
    createStripeCheckoutSessionInDB,
};