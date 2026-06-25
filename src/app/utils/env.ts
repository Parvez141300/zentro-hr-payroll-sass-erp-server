import dotenv from "dotenv";

dotenv.config();

interface IEnvVarialbleConfig {
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
}

const loadEnvVariables = (): IEnvVarialbleConfig => {
    const requireEnvVariables = [
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
    ];

    requireEnvVariables.forEach((envVariable) => {
        if (!process.env[envVariable]) {
            throw new Error(`Missing env variable ${envVariable}`);
        }
    });

    return {
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
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: process.env.JWT_REFRESH_TOKEN_EXPIRATION_TIME as string
    }
}

export const envVars = loadEnvVariables();