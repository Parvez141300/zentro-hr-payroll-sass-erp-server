import { CookieOptions, Request, Response } from "express";

const setCookie = (res: Response, cookieName: string, cookieValue: string, options: CookieOptions) => {
    res.cookie(cookieName, cookieValue, options);
}

const getCookie = (req: Request, cookieName: string) => {
    return req.cookies[cookieName];
}

const clearCookie = (res: Response, cookieName: string, options: CookieOptions) => {
    res.clearCookie(cookieName, options);
}

export const cookieUtils = {
    setCookie,
    getCookie,
    clearCookie,
}