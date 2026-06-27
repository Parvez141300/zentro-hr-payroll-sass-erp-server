import { NextFunction, Request, Response } from "express";
import { cookieUtils } from "../utils/cookie";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../utils/env";
import { Role } from "../../generated/prisma/enums";

export const checkAuthMiddleware = (...authRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('cookie data from global check auth', req.cookies);
            const sessionToken = cookieUtils.getCookie(req, "accessToken");

            if (!sessionToken) {
                throw new Error("Unauthorized access! No session token found.");
            }

            if (sessionToken) {
                const isExistSessionToken = await prisma.session.findUnique({
                    where: {
                        token: sessionToken,
                        expiresAt: {
                            gt: new Date(),
                        },
                    },
                    include: {
                        user: true,
                    }
                });

                if (isExistSessionToken && isExistSessionToken.user) {
                    const user = isExistSessionToken.user;
                    console.log("user data from check auth middleware", user);

                    const now = new Date();
                    const expiresAt = new Date(isExistSessionToken.expiresAt);
                    const createdAt = new Date(isExistSessionToken.createdAt);

                    const sessionLifeTime = expiresAt.getTime() - createdAt.getTime();
                    const remainingTime = expiresAt.getTime() - now.getTime();

                    const remainingTimePercentage = (remainingTime / sessionLifeTime) * 100;

                    console.log("remaining time percentage", remainingTimePercentage);

                    if (remainingTimePercentage < 20) {
                        res.set({
                            "X-Session-Refresh": "true",
                            "X-Session-Expires-At": expiresAt.toISOString(),
                            "X-Time-Remaining": remainingTime.toString(),
                        });

                        console.log('sessin is expiring soon');
                    }

                    if (!user.isActive) {
                        throw new Error("Unauthorized access! User is inactive.");
                    }

                    if (user.isDeleted) {
                        throw new Error("Unauthorized access! User is deleted.");
                    }
                }
            }

            // access token check
            const accessToken = cookieUtils.getCookie(req, "accessToken");
            if (!accessToken) {
                throw new Error("Unauthorized access! No access token found.");
            }

            const verifyToken = jwtUtils.verifyToken(accessToken, envVars.JWT_TOKEN_SECRET);
            if (!verifyToken.success) {
                throw new Error("Unauthorized access! Invalid access token.");
            }

            req.user = {
                companyId: verifyToken.data?.companyId,
                userId: verifyToken.data?.userId,
                name: verifyToken.data?.name,
                email: verifyToken.data?.email,
                role: verifyToken.data?.role,
                isActive: verifyToken.data?.isActive,
                isDeleted: verifyToken.data?.isDeleted
            }

            if (authRoles.length > 0 && !authRoles.includes(verifyToken.data?.role as Role)) {
                throw new Error("Unauthorized access! Invalid user role.");
            }

            next();
        } catch (error) {
            next(error);
        }
    }
}