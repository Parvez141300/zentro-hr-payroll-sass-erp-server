import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role } from "../../generated/prisma/enums";
import { envVars } from "../utils/env";
import { convertMilisecondToSecond } from "../utils/convertMilisecondToSecond";
import ms, { StringValue } from "ms";
import { bearer, emailOTP } from "better-auth/plugins";
// If your Prisma file is located elsewhere, you can change the path

export const auth = betterAuth({
    baseURL: envVars.BETTER_AUTH_URL,
    secret: envVars.BETTER_AUTH_SECRET,
    database: prismaAdapter(prisma, {
        provider: "postgresql", // or "mysql", "postgresql", ...etc
    }),
    emailAndPassword: {
        enabled: true,
        minPasswordLength: 8,
        autoSignIn: false,
        requireEmailVerification: false,
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: true,
                defaultValue: Role.EMPLOYEE,
            },
            isActive: {
                type: "boolean",
                required: true,
                defaultValue: true,
            },
            isDeleted: {
                type: "boolean",
                required: true,
                defaultValue: false,
            },
            deletedAt: {
                type: "date",
                required: false,
                defaultValue: null,
            },
            companyId: {
                type: "string",
                required: false,
                defaultValue: null,
            }
        }
    },
    trustedOrigins: [envVars.FRONTEND_URL, envVars.BETTER_AUTH_URL, "http://localhost:3000", "http://localhost:5000"],
    advanced: {
        cookies: {
            session_token: {
                attributes: {
                    httpOnly: true,
                    secure: envVars.NODE_ENV === "production",
                    sameSite: "none",
                    path: "/",
                }
            },
        }
    },
    session: {
        expiresIn: convertMilisecondToSecond(ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
        updateAge: convertMilisecondToSecond(ms(envVars.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as StringValue)),
        cookieCache: {
            enabled: true,
            maxAge: convertMilisecondToSecond(ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
        }
    },
    plugins: [
        bearer(),
        emailOTP({
            overrideDefaultEmailVerification: true,
            async sendVerificationOTP({ email, otp, type }) {
                if (type === "forget-password") {
                    return
                }
            },
            otpLength: 6, // otp length, default is 6
            expiresIn: 60 * 2, // otp expires in seconds, default is 120 (2 minutes)
        }),
    ],
});