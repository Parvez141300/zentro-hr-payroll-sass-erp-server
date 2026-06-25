import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { Role } from "../../generated/prisma/enums";
import { envVars } from "../utils/env";
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
    }
});