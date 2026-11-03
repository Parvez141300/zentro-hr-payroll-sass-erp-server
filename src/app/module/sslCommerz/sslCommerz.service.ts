/* eslint-disable @typescript-eslint/no-explicit-any */
import { PaymentGateway, PaymentStatus, Role, SubscriptionPlan, SubscriptionStatus } from "../../../generated/prisma/enums";
import { uploadFileToCloudinary } from "../../config/cloudinary.utils";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../utils/env";
import { generateInvoicePdf } from "../../utils/generateInvoicePdf";
import { sendEmail } from "../../utils/sendEmail";
import { getSubscriptionEndDate } from "../stripe/stripe.service";
import {
    ISSLCommerzFailedOrCancelPayload,
    ISSLCommerzInitiatePaymentPayload,
    ISSLCommerzSuccessPayload,
} from "./sslCommerz.interface";
import SSLCommerzPayment from "sslcommerz-lts";

const PAYMENTS_PAGE = `${envVars.FRONTEND_URL}/super-admin/dashboard/payments`;

const getSSLCommerzClient = () =>
    new SSLCommerzPayment(
        envVars.SSLCOMMERZ.SSLCOMMERZ_STORE_ID,
        envVars.SSLCOMMERZ.SSLCOMMERZ_STORE_PASSWORD,
        envVars.SSLCOMMERZ.SSLCOMMERZ_IS_LIVE
    );

/* ------------------------------------------------------------------ */
/* 1. Initiate                                                         */
/* ------------------------------------------------------------------ */
const initiateSSLCommerzPaymentInDB = async (payload: ISSLCommerzInitiatePaymentPayload) => {
    const { companyId, userId, planName, billingCycle } = payload;

    if (billingCycle !== "MONTHLY" && billingCycle !== "YEARLY") {
        throw new Error(`Invalid billing cycle: ${billingCycle}`);
    }

    const isExistCompany = await prisma.company.findUnique({ where: { id: companyId } });
    if (!isExistCompany) {
        throw new Error("Company not found for SSLCommerz payment");
    }

    const isExistUser = await prisma.user.findUnique({
        where: { id: userId, companyId: companyId },
    });
    if (!isExistUser) {
        throw new Error("User not found for SSLCommerz payment");
    }

    if (isExistUser.role !== Role.Super_ADMIN) {
        throw new Error("Only the Super Admin of the company can buy this plan");
    }

    const isExistSuperAdmin = await prisma.superAdmin.findFirst({
        where: { userId: isExistUser.id },
    });
    if (!isExistSuperAdmin) {
        throw new Error("Super admin not found for SSLCommerz payment");
    }

    const planConfig = await prisma.subscriptionPlanConfig.findUnique({
        where: { name: planName as SubscriptionPlan },
    });
    if (!planConfig) {
        throw new Error("Subscription plan config not found for SSLCommerz payment");
    }

    // Active subscription guard
    const hasActiveSubscription =
        isExistCompany.subscriptionPlan !== SubscriptionPlan.FREE &&
        isExistCompany.subscriptionStatus === SubscriptionStatus.ACTIVE &&
        !!isExistCompany.subscriptionExpiry &&
        isExistCompany.subscriptionExpiry > new Date();

    if (hasActiveSubscription) {
        if (isExistCompany.subscriptionPlan === planName) {
            throw new Error(
                `You already have an active ${planName} plan until ${isExistCompany.subscriptionExpiry!.toDateString()}`
            );
        }
        throw new Error("You already have an active subscription. To change your plan, please use 'Manage Subscription'.");
    }

    const amountBDT = billingCycle === "MONTHLY" ? planConfig.priceBDT : planConfig.yearlyPriceBDT;
    if (amountBDT === null || amountBDT === undefined) {
        throw new Error(`Price not configured for ${billingCycle} billing cycle`);
    }

    const transactionId = `txn-${Date.now()}-${isExistCompany.id}`;

    const payment = await prisma.payment.create({
        data: {
            companyId: isExistCompany.id,
            gateway: PaymentGateway.SSLCOMMERZ,
            plan: planName as SubscriptionPlan,
            amountBDT: amountBDT,
            status: PaymentStatus.PENDING,
            transactionId: transactionId,
        },
    });

    // এই URL গুলো অবশ্যই backend-এর (SSLCommerz এখানে POST করে)
    const data = {
        total_amount: amountBDT,
        currency: "BDT",
        tran_id: transactionId,
        success_url: `${envVars.BACKEND_URL}/api/v1/sslcommerz/success`,
        fail_url: `${envVars.BACKEND_URL}/api/v1/sslcommerz/fail`,
        cancel_url: `${envVars.BACKEND_URL}/api/v1/sslcommerz/cancel`,
        ipn_url: `${envVars.BACKEND_URL}/api/v1/sslcommerz/ipn`,
        product_name: `Zentro ${planConfig.displayName} Plan (${billingCycle})`,
        product_category: "Software Subscription",
        product_profile: "general",
        cus_name: isExistUser.name || isExistCompany.name,
        cus_email: isExistUser.email || isExistCompany.email,
        cus_add1: isExistCompany.address || "N/A",
        cus_city: "Dhaka",
        cus_state: "Dhaka",
        cus_postcode: "1000",
        cus_country: "Bangladesh",
        cus_phone: isExistCompany.phone || isExistSuperAdmin.phone || "",
        shipping_method: "NO",
        num_of_item: 1,
        value_a: isExistCompany.id,
        value_b: planConfig.name,
        value_c: isExistUser.id,
        value_d: billingCycle,
    };

    const sslcz = getSSLCommerzClient();
    const response = await sslcz.init(data);

    if (!response?.GatewayPageURL) {
        await prisma.payment.update({
            where: { id: payment.id },
            data: { status: PaymentStatus.FAILED },
        });
        throw new Error(`Failed to initiate SSLCommerz payment: ${response?.failedreason ?? "unknown reason"}`);
    }

    await prisma.payment.update({
        where: { id: payment.id },
        data: { sslSessionKey: response.sessionkey },
    });

    return {
        url: response.GatewayPageURL,
        paymentId: payment.id,
        transactionId: transactionId,
        sessionId: response.sessionkey,
    };
};

/* ------------------------------------------------------------------ */
/* 2. Success (ব্রাউজার redirect + IPN দুটোই এখানে আসে)               */
/* ------------------------------------------------------------------ */
const handleSSLCommerzSuccessInDB = async (payload: ISSLCommerzSuccessPayload) => {
    const { status, tran_id, val_id } = payload;

    const successRedirect = { message: `${PAYMENTS_PAGE}?payment=success` };
    const failedRedirect = { message: `${PAYMENTS_PAGE}?payment=failed` };

    if ((status !== "VALID" && status !== "VALIDATED") || !tran_id || !val_id) {
        return failedRedirect;
    }

    const payment = await prisma.payment.findUnique({
        where: { transactionId: tran_id },
        include: { company: { include: { users: true } } },
    });
    if (!payment) {
        throw new Error("Payment not found for SSLCommerz success");
    }

    // Idempotency: আগেই প্রসেস হয়ে থাকলে আবার নয়
    if (payment.status === PaymentStatus.SUCCESS) {
        return successRedirect;
    }

    const planConfig = await prisma.subscriptionPlanConfig.findUnique({
        where: { name: payment.plan },
    });
    if (!planConfig) {
        throw new Error(`Subscription plan config not found for plan: ${payment.plan}`);
    }

    // SSLCommerz সার্ভার থেকে নিজে যাচাই
    const sslcz = getSSLCommerzClient();
    const validation = await sslcz.validate({ val_id });

    const isValid = validation.status === "VALID" || validation.status === "VALIDATED";
    const tranMatches = validation.tran_id === tran_id;
    const amountMatches = Math.abs(Number(validation.amount) - (payment.amountBDT ?? 0)) < 0.01;
    const currencyMatches = validation.currency_type === "BDT";

    if (!isValid || !tranMatches || !amountMatches || !currencyMatches) {
        await prisma.payment.updateMany({
            where: { id: payment.id, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.FAILED },
        });
        return failedRedirect;
    }

    // DB-র amount থেকে billingCycle নির্ধারণ (value_d-র ওপর নির্ভর নয়)
    const billingCycle: "MONTHLY" | "YEARLY" =
        planConfig.yearlyPriceBDT != null &&
            Math.abs((payment.amountBDT ?? 0) - planConfig.yearlyPriceBDT) < 0.01
            ? "YEARLY"
            : "MONTHLY";

    const subscriptionStart = new Date();
    const subscriptionEnd = getSubscriptionEndDate(billingCycle, subscriptionStart);

    const result = await prisma.$transaction(async (tx) => {
        // শুধু PENDING হলেই আপডেট, success ও IPN একসাথে এলে ডুপ্লিকেট হবে না
        const claimed = await tx.payment.updateMany({
            where: { id: payment.id, status: PaymentStatus.PENDING },
            data: {
                status: PaymentStatus.SUCCESS,
                sslValId: val_id,
                paidAt: subscriptionStart,
                subscriptionStart: subscriptionStart,
                subscriptionEnd: subscriptionEnd,
            },
        });

        if (claimed.count === 0) return null;

        await tx.company.update({
            where: { id: payment.companyId },
            data: {
                subscriptionPlan: payment.plan,
                subscriptionStatus: SubscriptionStatus.ACTIVE,
                subscriptionExpiry: subscriptionEnd,
                maxEmployees: planConfig.maxEmployees,
            },
        });

        await tx.subscriptionHistory.create({
            data: {
                companyId: payment.companyId,
                plan: payment.plan,
                status: SubscriptionStatus.ACTIVE,
                paymentId: payment.id,
                startDate: subscriptionStart,
                endDate: subscriptionEnd,
            },
        });

        return true;
    });

    // অন্য কেউ (IPN বা redirect) আগেই প্রসেস করে ফেলেছে
    if (!result) {
        return successRedirect;
    }

    // Invoice ও email: fail করলেও পেমেন্ট সফলই থাকবে
    try {
        const customer = payment.company?.users[0];

        const pdfBuffer = await generateInvoicePdf({
            invoiceId: payment.id,
            transactionId: payment.transactionId as string,
            companyName: payment.company?.name as string,
            customerName: customer?.name as string,
            customerEmail: customer?.email as string,
            planName: payment.plan as string,
            amount: payment.amountBDT as number,
            paymentDate: subscriptionStart,
            paymentGateway: payment.gateway,
            billingCycle: billingCycle,
        });

        const cloudinaryResponse = (await uploadFileToCloudinary(pdfBuffer, "invoice.pdf")) as { secure_url: string };
        const invoiceUrl = cloudinaryResponse.secure_url;

        await prisma.payment.update({
            where: { id: payment.id },
            data: { invoiceUrl },
        });

        await sendEmail({
            to: customer?.email as string,
            subject: "Invoice",
            templateName: "invoice",
            templateData: {
                transactionId: payment.transactionId as string,
                invoiceId: payment.id,
                companyName: payment.company?.name as string,
                customerName: customer?.name as string,
                customerEmail: customer?.email as string,
                planName: payment.plan as string,
                amount: payment.amountBDT as number,
                paymentDate: subscriptionStart.toISOString(),
                invoiceUrl,
                paymentGateway: payment.gateway,
                billingCycle: billingCycle,
            },
            attachments: [
                { filename: "invoice.pdf", content: pdfBuffer, contentType: "application/pdf" },
            ],
        });
    } catch (error) {
        console.error("Invoice/email failed after successful SSLCommerz payment:", error);
    }

    return successRedirect;
};

/* ------------------------------------------------------------------ */
/* 3. Fail / Cancel                                                    */
/* ------------------------------------------------------------------ */
const handleSSLCommerzFailInDB = async (payload: ISSLCommerzFailedOrCancelPayload) => {
    const { tran_id } = payload;

    if (tran_id) {
        await prisma.payment.updateMany({
            where: { transactionId: tran_id, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.FAILED },
        });
    }

    return { message: `${PAYMENTS_PAGE}?payment=failed` };
};

const handleSSLCommerzCancelInDB = async (payload: ISSLCommerzFailedOrCancelPayload) => {
    const { tran_id } = payload;

    if (tran_id) {
        await prisma.payment.updateMany({
            where: { transactionId: tran_id, status: PaymentStatus.PENDING },
            data: { status: PaymentStatus.CANCELLED },
        });
    }

    return { message: `${PAYMENTS_PAGE}?payment=cancel` };
};

export const sslCommerzService = {
    initiateSSLCommerzPaymentInDB,
    handleSSLCommerzSuccessInDB,
    handleSSLCommerzFailInDB,
    handleSSLCommerzCancelInDB,
};