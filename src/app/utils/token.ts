import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "./env";
import { Response } from "express";
import { cookieUtils } from "./cookie";
import ms, { StringValue } from "ms";

const getAccessToken = (payload: JwtPayload) => {
    const accessToken = jwtUtils.createToken(
        payload, envVars.JWT_TOKEN_SECRET,
        { expiresIn: envVars.JWT_ACCESS_TOKEN_EXPIRATION_TIME } as SignOptions
    );

    return accessToken;
}

const getRefreshToken = (payload: JwtPayload) => {
    const refreshToken = jwtUtils.createToken(
        payload, envVars.JWT_TOKEN_SECRET,
        { expiresIn: envVars.JWT_REFRESH_TOKEN_EXPIRATION_TIME } as SignOptions
    );

    return refreshToken;
}

const setAccessTokenInCookie = (res: Response, accessToken: string) => {
    const maxAge = ms(envVars.JWT_ACCESS_TOKEN_EXPIRATION_TIME as StringValue);
    cookieUtils.setCookie(
        res, 
        "accessToken", 
        accessToken, 
        { 
            httpOnly: true, 
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
            maxAge: maxAge,
        }
    );
}

const setRefreshTokenInCookie = (res: Response, refreshToken: string) => {
    const maxAge = ms(envVars.JWT_REFRESH_TOKEN_EXPIRATION_TIME as StringValue);
    cookieUtils.setCookie(
        res, 
        "refreshToken", 
        refreshToken, 
        { 
            httpOnly: true, 
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
            maxAge: maxAge,
        }
    );
}

const setBetterAuthSessionTokenInCookie = (res: Response, sessionToken: string) => {
    const maxAge = ms(envVars.JWT_REFRESH_TOKEN_EXPIRATION_TIME as StringValue);
    cookieUtils.setCookie(
        res, 
        "better-auth.session_token", 
        sessionToken, 
        { 
            httpOnly: true, 
            secure: envVars.NODE_ENV === "production",
            sameSite: "none",
            maxAge: maxAge,
        }
    );
}

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
    setAccessTokenInCookie,
    setRefreshTokenInCookie,
    setBetterAuthSessionTokenInCookie,
}