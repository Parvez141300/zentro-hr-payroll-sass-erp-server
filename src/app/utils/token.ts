import { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envVars } from "./env";

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

export const tokenUtils = {
    getAccessToken,
    getRefreshToken,
}