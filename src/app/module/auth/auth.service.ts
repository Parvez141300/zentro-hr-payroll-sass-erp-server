import { JwtPayload } from "jsonwebtoken";
import { Role, SubscriptionPlan, SubscriptionStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { envVars } from "../../utils/env";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import { IChangePasswordPayload, ILoginUserPayload, IRegisterSuperAdminPayload } from "./auth.interface"
import ms, { StringValue } from "ms";

const registerSuperAdminInDB = async (payload: IRegisterSuperAdminPayload) => {
  const { name, companyName, email, password, phone, address } = payload;

  const isExistUser = await prisma.user.findUnique({
    where: {
      email: email,
    }
  });

  if (isExistUser) {
    throw new Error("User already exist");
  }

  const isExistCompany = await prisma.company.findUnique({
    where: {
      email: email,
    }
  });

  if (isExistCompany) {
    throw new Error("Company already exist");
  }

  // step 1: create company
  const company = await prisma.company.create({
    data: {
      name: companyName,
      email: email,
      phone: phone,
      address: address,
      subscriptionPlan: SubscriptionPlan.FREE,
      subscriptionStatus: SubscriptionStatus.TRIAL,
      maxEmployees: 10,
    }
  });

  if (!company.id) {
    throw new Error("Company not created");
  }

  // step 2: create super admin
  const register = await auth.api.signUpEmail({
    body: {
      companyId: company.id,
      name: name,
      email: email,
      password: password,
      role: Role.Super_ADMIN,
    }
  });

  if (!register.user.id) {
    await prisma.company.delete(
      {
        where: {
          id: company.id
        }
      }
    );
    throw new Error("User not created");
  }

  await prisma.$transaction(async (tx) => {
    // step 3: create super admin
    await tx.superAdmin.create({
      data: {
        userId: register.user.id,
        companyId: company.id,
        name: name,
        phone: phone,
      }
    });

    // step 4: create subscription history
    await tx.subscriptionHistory.create({
      data: {
        companyId: company.id,
        plan: SubscriptionPlan.FREE,
        status: SubscriptionStatus.TRIAL,
        startDate: new Date(),
        endDate: new Date("2099-01-01"),
        paymentId: null,
      }
    });
  });

  return register;
}

const loginUserInDB = async (payload: ILoginUserPayload) => {
  const { email, password } = payload;
  const loginData = await auth.api.signInEmail({
    body: {
      email: email,
      password: password,
    }
  });

  if (!loginData.user.isActive) {
    throw new Error("User is inactive");
  }

  if (loginData.user.isDeleted) {
    throw new Error("User is deleted");
  }

  if (!loginData.user.id) {
    throw new Error("User not logged in");
  }

  const accessToken = tokenUtils.getAccessToken({
    companyId: loginData.user.companyId,
    userId: loginData.user.id,
    name: loginData.user.name,
    email: loginData.user.email,
    role: loginData.user.role,
    isActive: loginData.user.isActive,
    isDeleted: loginData.user.isDeleted,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    companyId: loginData.user.companyId,
    userId: loginData.user.id,
    name: loginData.user.name,
    email: loginData.user.email,
    role: loginData.user.role,
    isActive: loginData.user.isActive,
    isDeleted: loginData.user.isDeleted,
  });

  return { ...loginData, accessToken, refreshToken };
}

const logoutUserInDB = async (sessionToken: string) => {
  const userLogout = await auth.api.signOut({
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    }),
  });

  if (!userLogout.success) {
    throw new Error("User not logged out");
  }

  return userLogout.success;
}

const getNewTokenFromDB = async (sessionToken: string, refreshToken: string) => {
  const isExistSessionToken = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    }
  });

  if (!isExistSessionToken) {
    throw new Error("Session token not found");
  }

  const verifyRefreshToken = jwtUtils.verifyToken(refreshToken, envVars.JWT_TOKEN_SECRET);

  if (!verifyRefreshToken.success && verifyRefreshToken.error) {
    throw new Error("Refresh token is invalid");
  }

  const user = verifyRefreshToken.data as JwtPayload;

  const accessToken = tokenUtils.getAccessToken({
    companyId: user.companyId,
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    isDeleted: user.isDeleted,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    companyId: user.companyId,
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    isActive: user.isActive,
    isDeleted: user.isDeleted,
  });

  const { token } = await prisma.session.update({
    where: {
      token: sessionToken,
    },
    data: {
      token: sessionToken,
      expiresAt: new Date(Date.now() + ms(envVars.BETTER_AUTH_SESSION_TOKEN_EXPIRES_IN as StringValue)),
      updatedAt: new Date(),
    }
  });

  return {
    sessionToken: token,
    accessToken: accessToken,
    refreshToken: newRefreshToken,
  };
}

const changePassowrdInDB = async (sessionToken: string, payload: IChangePasswordPayload) => {
  const { currentPassword, newPassword } = payload;

  const isExistSessionToken = await prisma.session.findUnique({
    where: {
      token: sessionToken,
    }
  });

  if (!isExistSessionToken) {
    throw new Error("Session token not found");
  }

  const result = await auth.api.changePassword({
    body: {
      currentPassword: currentPassword,
      newPassword: newPassword,
      revokeOtherSessions: true,
    },
    headers: new Headers({
      Authorization: `Bearer ${sessionToken}`
    })
  });

  const accessToken = tokenUtils.getAccessToken({
    companyId: result.user.companyId,
    userId: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
    isActive: result.user.isActive,
    isDeleted: result.user.isDeleted,
  });

  const refreshToken = tokenUtils.getRefreshToken({
    companyId: result.user.companyId,
    userId: result.user.id,
    name: result.user.name,
    email: result.user.email,
    role: result.user.role,
    isActive: result.user.isActive,
    isDeleted: result.user.isDeleted,
  });

  return { ...result, accessToken, refreshToken };
}

const getLoggedInUserInfoFromDB = async (accessToken: string) => {
  const userInfo = jwtUtils.verifyToken(accessToken, envVars.JWT_TOKEN_SECRET);

  if (!userInfo.success && userInfo.error) {
    throw new Error("Access token is invalid");
  }

  return userInfo.data;
}

export const authService = {
  registerSuperAdminInDB,
  loginUserInDB,
  getNewTokenFromDB,
  logoutUserInDB,
  changePassowrdInDB,
  getLoggedInUserInfoFromDB,
}