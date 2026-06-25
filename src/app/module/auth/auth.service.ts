import { SubscriptionPlan, SubscriptionStatus } from "../../../generated/prisma/enums";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { tokenUtils } from "../../utils/token";
import { ILoginUserPayload, IRegisterSuperAdminPayload } from "./auth.interface"

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
    }
  });

  if (!register.user.id) {
    throw new Error("User not created");
  }

  // step 3: create super admin
  await prisma.superAdmin.create({
    data: {
      userId: register.user.id,
      companyId: company.id,
      fullName: name,
      phone: phone,
    }
  });

  // step 4: create subscription history
  await prisma.subscriptionHistory.create({
    data: {
      companyId: company.id,
      plan: SubscriptionPlan.FREE,
      status: SubscriptionStatus.TRIAL,
      startDate: new Date(),
      endDate: new Date("2099-01-01"),
      paymentId: null,
    }
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

export const authService = {
  registerSuperAdminInDB,
  loginUserInDB,
}