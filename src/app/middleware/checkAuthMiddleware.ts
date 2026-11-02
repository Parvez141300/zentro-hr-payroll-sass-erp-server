import { NextFunction, Request, Response } from "express";
import { cookieUtils } from "../utils/cookie";
import { Role } from "better-auth/plugins";
import { prisma } from "../lib/prisma";
import { jwtUtils } from "../utils/jwt";
import { envVars } from "../utils/env";

export const checkAuthMiddleware = (...authRoles: Role[]) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            const sessionToken = cookieUtils.getCookie(req, "better-auth.session_token");
            const refreshToken = cookieUtils.getCookie(req, "refreshToken");
            const accessToken = cookieUtils.getCookie(req, "accessToken");

            if (!sessionToken) throw new Error("Unauthorized! No session token.");
            if (!refreshToken) throw new Error("Unauthorized! No refresh token.");
            if (!accessToken) throw new Error("Unauthorized! No access token.");

            // 1. সস্তা চেক আগে: access token
            const verifyAccess = jwtUtils.verifyToken(accessToken, envVars.JWT_TOKEN_SECRET);
            if (!verifyAccess.success || !verifyAccess.data) {
                throw new Error("Unauthorized! Invalid access token.");
            }

            // 2. refresh token
            const verifyRefresh = jwtUtils.verifyToken(refreshToken, envVars.JWT_TOKEN_SECRET);
            if (!verifyRefresh.success || !verifyRefresh.data?.exp || !verifyRefresh.data?.iat) {
                throw new Error("Unauthorized! Invalid refresh token.");
            }

            // 3. DB session
            const session = await prisma.session.findUnique({
                where: { token: sessionToken },
                include: { user: true },
            });
            if (!session || session.expiresAt <= new Date() || !session.user) {
                throw new Error("Unauthorized! Invalid or expired session.");
            }

            const user = session.user;
            if (!user.isActive) throw new Error("Unauthorized! User is inactive.");
            if (user.isDeleted) throw new Error("Unauthorized! User is deleted.");

            // 4. refresh token কত সময় বাকি (exp/iat সেকেন্ডে, তাই * 1000)
            const expiresAtMs = verifyRefresh.data.exp * 1000;
            const createdAtMs = verifyRefresh.data.iat * 1000;
            const lifeTime = expiresAtMs - createdAtMs;
            const remaining = expiresAtMs - Date.now();

            if ((remaining / lifeTime) * 100 < 20) {
                res.set({
                    "X-Refresh-Token-Refresh": "true",
                    "X-Refresh-Token-Expires-At": new Date(expiresAtMs).toISOString(),
                });
            }

            // 5. role চেক
            const role = verifyAccess.data.role;
            if (authRoles.length > 0 && !authRoles.includes(role)) {
                throw new Error("Unauthorized! Invalid user role.");
            }

            req.user = {
                companyId: verifyAccess.data.companyId,
                userId: verifyAccess.data.userId,
                name: verifyAccess.data.name,
                email: verifyAccess.data.email,
                role: role,
                isActive: user.isActive,
                isDeleted: user.isDeleted,
            };

            next();
        } catch (error) {
            next(error);
        }
    };
};