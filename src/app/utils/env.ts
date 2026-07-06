import dotenv from "dotenv";

dotenv.config();

interface IEnvVarialbleConfig {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    BETTER_AUTH_URL: string;
    BETTER_AUTH_SECRET: string;
    PLATFORM_SUPER_ADMIN_NAME: string;
    PLATFORM_SUPER_ADMIN_EMAIL: string;
    PLATFORM_SUPER_ADMIN_PASSWORD: string;
    FRONTEND_URL: string;
    JWT_TOKEN_SECRET: string;
    JWT_ACCESS_TOKEN_EXPIRATION_TIME: string;
    JWT_REFRESH_TOKEN_EXPIRATION_TIME: string;
    BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: string;
    BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: string;
    EMAIL_SENDER: {
        SMTP_HOST: string;
        SMTP_PORT: string;
        SMTP_USER: string;
        SMTP_PASSWORD: string;
        SMTP_FROM: string;
    };
    CLOUDINARY: {
        CLOUDINARY_CLOUD_NAME: string;
        CLOUDINARY_API_KEY: string;
        CLOUDINARY_API_SECRET: string;
    };
    STRIPE: {
        STRIPE_SECRET_KEY: string;
        STRIPE_WEBHOOK_SECRET: string;
    }
}

const loadEnvVariables = (): IEnvVarialbleConfig => {
    const requireEnvVariables = [
        "NODE_ENV",
        "PORT",
        "DATABASE_URL",
        "BETTER_AUTH_URL",
        "BETTER_AUTH_SECRET",
        "PLATFORM_SUPER_ADMIN_NAME",
        "PLATFORM_SUPER_ADMIN_EMAIL",
        "PLATFORM_SUPER_ADMIN_PASSWORD",
        "FRONTEND_URL",
        "JWT_TOKEN_SECRET",
        "JWT_ACCESS_TOKEN_EXPIRATION_TIME",
        "JWT_REFRESH_TOKEN_EXPIRATION_TIME",
        "BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN",
        "BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE",
        "SMTP_HOST",
        "SMTP_PORT",
        "SMTP_USER",
        "SMTP_PASSWORD",
        "SMTP_FROM",
        "CLOUDINARY_CLOUD_NAME",
        "CLOUDINARY_API_KEY",
        "CLOUDINARY_API_SECRET",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
    ];

    requireEnvVariables.forEach((envVariable) => {
        if (!process.env[envVariable]) {
            throw new Error(`Missing env variable ${envVariable}`);
        }
    });

    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
        BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
        PLATFORM_SUPER_ADMIN_NAME: process.env.PLATFORM_SUPER_ADMIN_NAME as string,
        PLATFORM_SUPER_ADMIN_EMAIL: process.env.PLATFORM_SUPER_ADMIN_EMAIL as string,
        PLATFORM_SUPER_ADMIN_PASSWORD: process.env.PLATFORM_SUPER_ADMIN_PASSWORD as string,
        FRONTEND_URL: process.env.FRONTEND_URL as string,
        JWT_TOKEN_SECRET: process.env.JWT_TOKEN_SECRET as string,
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: process.env.JWT_ACCESS_TOKEN_EXPIRATION_TIME as string,
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME as string,
        BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN: process.env.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as string,
        BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE: process.env.BETTER_AUTH_SESSION_TOKEN_UPDATE_AGE as string,
        EMAIL_SENDER: {
            SMTP_HOST: process.env.SMTP_HOST as string,
            SMTP_PORT: process.env.SMTP_PORT as string,
            SMTP_USER: process.env.SMTP_USER as string,
            SMTP_PASSWORD: process.env.SMTP_PASSWORD as string,
            SMTP_FROM: process.env.SMTP_FROM as string,
        },
        CLOUDINARY: {
            CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
            CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
            CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
        },
        STRIPE: {
            STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
            STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
        },
    }
}

export const envVars = loadEnvVariables();