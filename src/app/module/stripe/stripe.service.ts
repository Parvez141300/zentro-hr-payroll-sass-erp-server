/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaymentGateway, PaymentStatus, SubscriptionPlan, SubscriptionStatus } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.utils";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../utils/env";
import { generateInvoicePdf } from "../../utils/generateInvoicePdf";
import { sendEmail } from "../../utils/sendEmail";
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
            planName: isExistsSubscriptionPlanConfig.name,
            paymentId: payment.id,
        },
    });

    return {
        sessionId: session.id,
        paymentId: payment.id,
        url: session.url,
    };
};

const handleStripeWebhookInDB = async (payload: any, signature: string) => {
    console.log(payload, signature, "this is from the stripe webhook");

    let event: Stripe.Event;

    if (!envVars.STRIPE.STRIPE_WEBHOOK_SECRET) {
        throw new Error("Stripe webhook secret not found");
    }

    try {
        event = stripe.webhooks.constructEvent(payload, signature, envVars.STRIPE.STRIPE_WEBHOOK_SECRET);
    } catch (error: any) {
        throw new Error("Stripe webhook error", error);
    }

    switch (event.type) {
        case "checkout.session.completed": {
            await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
            break;
        }

        case "checkout.session.expired": {
            const session = event.data.object;
            console.log(`Stripe checkout session expired: ${session.id}`);
            break;
        }

        case "payment_intent.payment_failed": {
            const paymentIntent = event.data.object;
            console.log(`Stripe payment intent failed: ${paymentIntent.id}`);
            break;
        }

        default:
            console.log(`Unhandled Stripe event type: ${event.type}`);
            break;
    }

    return { message: "Stripe webhook processed successfully event: " + event.id };
};

const handleCheckoutSessionCompleted = async (session: Stripe.Checkout.Session) => {
    const { companyId, companyName, paymentId, planName } = session.metadata as Record<string, string>;

    const result = await prisma.$transaction(async (tx) => {
        const subscriptionPlanConfig = await tx.subscriptionPlanConfig.findUnique({
            where: {
                name: planName as SubscriptionPlan,
            }
        });

        const payment = await tx.payment.update({
            where: {
                id: paymentId,
            },
            data: {
                status: PaymentStatus.SUCCESS,
                stripePaymentIntentId: session.payment_intent as string,
                stripeSubscriptionId: session.subscription as string,
                stripeInvoiceId: session.invoice as string,
                paidAt: new Date(),
                subscriptionStart: new Date(),
                subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            }
        });

        const company = await tx.company.update({
            where: {
                id: companyId,
                name: companyName,
            },
            data: {
                subscriptionPlan: subscriptionPlanConfig!.name as SubscriptionPlan,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                subscriptionExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                maxEmployees: subscriptionPlanConfig!.maxEmployees,
                stripeSubscriptionId: session.subscription as string,
            }
        });

        const subscriptionHistory = await tx.subscriptionHistory.create({
            data: {
                plan: subscriptionPlanConfig!.name as SubscriptionPlan,
                status: SubscriptionStatus.ACTIVE,
                companyId: companyId,
                paymentId: payment.id,
                startDate: new Date(),
                endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            }
        });

        return {
            companyId: company.id,
            paymentId: payment.id,
            subscriptionHistoryId: subscriptionHistory.id,
            planName: subscriptionPlanConfig!.name as SubscriptionPlan
        };
    });

    // get payment data
    const paymentData = await prisma.payment.findUnique({
        where: {
            id: paymentId,
        },
        include: {
            company: {
                include: {
                    users: true,
                }
            }
        }
    });

    // Generate Invoice PDF
    const pdfBuffer = await generateInvoicePdf({
        invoiceId: paymentData?.id as string,
        transactionId: paymentData?.transactionId as string,
        companyName: paymentData?.company?.name as string,
        customerName: paymentData?.company?.users[0]?.name as string,
        customerEmail: paymentData?.company?.users[0]?.email as string,
        planName: paymentData?.plan as string,
        amount: paymentData?.amountUSD as number,
        paymentDate: paymentData?.paidAt as Date,
        paymentGateway: paymentData?.gateway as string
    });

    // upload file to cloudinary
    const cloudinaryResponse = await uploadFileToCloudinary(pdfBuffer, 'invoice.pdf') as { secure_url: string };

    const invoiceUrl = cloudinaryResponse.secure_url;

    await prisma.payment.update({
        where: {
            id: paymentId,
        },
        data: {
            invoiceUrl: invoiceUrl,
        }
    });

    // send email to customer
    await sendEmail({
        to: paymentData?.company?.users[0]?.email as string,
        subject: "Invoice",
        templateName: "invoice",
        templateData: {
            transactionId: paymentData?.transactionId as string,
            invoiceId: paymentData?.id as string,
            companyName: paymentData?.company?.name as string,
            customerName: paymentData?.company?.users[0]?.name as string,
            customerEmail: paymentData?.company?.users[0]?.email as string,
            planName: paymentData?.plan as string,
            amount: paymentData?.amountUSD as number,
            paymentDate: paymentData?.paidAt ? new Date(paymentData?.paidAt).toISOString() : new Date(),
            invoiceUrl: invoiceUrl,
            paymentGateway: paymentData?.gateway as string
        },
        attachments: [{
            filename: 'invoice.pdf',
            content: pdfBuffer,
            contentType: 'application/pdf',
        }]
    });

    return result;
};

export const stripeService = {
    handleStripeWebhookInDB,
    createStripeCheckoutSessionInDB,
};