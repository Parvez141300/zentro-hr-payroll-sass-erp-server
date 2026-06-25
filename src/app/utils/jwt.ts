/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload, SignOptions } from "jsonwebtoken";


const createToken = (payload: JwtPayload, secret: string, { expiresIn }: SignOptions) => {
    return jwt.sign(payload, secret, { expiresIn });
};

const verifyToken = (token: string, secret: string) => {
    try {
        const deocded = jwt.verify(token, secret) as JwtPayload;
        return {
            success: true,
            data: deocded,
        }
    } catch (error: any) {
        return {
            success: false,
            data: null,
            message: error.message,
            error
        }
    }
};

export const jwtUtils = {
    createToken,
    verifyToken,
}