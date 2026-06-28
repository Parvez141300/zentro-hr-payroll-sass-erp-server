import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IUpdateAccountantPayload } from "./accountant.interface";

const updateCompanyAccountantInDB = async (companyId: string, accountantId: string, role: Role, payload: IUpdateAccountantPayload) => {
    const isExistAccountant = await prisma.accountant.findUnique({
        where: {
            companyId: companyId,
            id: accountantId
        }
    });

    if (!isExistAccountant) {
        throw new Error("Accountant not found");
    }

    if (role === Role.Super_ADMIN) {
        const updateAccountant = await prisma.$transaction(async (tx) => {
            const accountant = await tx.accountant.update({
                where: {
                    id: accountantId
                },
                data: {
                    ...payload,
                }
            });

            const userData = await tx.user.findUnique({
                where: {
                    id: accountant.userId
                }
            });

            await tx.user.update({
                where: {
                    id: accountant.userId
                },
                data: {
                    name: payload.name || userData?.name,
                    image: payload.photoUrl || userData?.image,
                }
            });

            return accountant;
        });

        return updateAccountant;
    }
    else {
        const updateAccountant = await prisma.$transaction(async (tx) => {
            const accountant = await tx.accountant.update({
                where: {
                    id: accountantId
                },
                data: {
                    name: payload.name || isExistAccountant.name,
                    phone: payload.phone || isExistAccountant.phone,
                    photoUrl: payload.photoUrl || isExistAccountant.photoUrl,
                    caLicenseNumber: payload.caLicenseNumber || isExistAccountant.caLicenseNumber,
                    taxIdNumber: payload.taxIdNumber || isExistAccountant.taxIdNumber,
                    bankName: payload.bankName || isExistAccountant.bankName,
                    bankAccount: payload.bankAccount || isExistAccountant.bankAccount,
                }
            });

            const userData = await tx.user.findUnique({
                where: {
                    id: accountant.userId
                }
            });

            await tx.user.update({
                where: {
                    id: accountant.userId
                },
                data: {
                    name: payload.name || userData?.name,
                    image: payload.photoUrl || userData?.image,
                }
            });

            return accountant;
        });
        return updateAccountant;
    }
};

const deleteCompanyAccountantFromDB = async (companyId: string, accountantId: string) => {
   const isExistAccountant = await prisma.accountant.findUnique({
       where: {
           companyId: companyId,
           id: accountantId
       }
   });

   if (!isExistAccountant) {
       throw new Error("Accountant not found");
   }
   
   const deleteAccoutant = await prisma.$transaction(async (tx) => {
       const dAccountant = await tx.accountant.delete({
           where: {
               id: accountantId
           }
       });

       await tx.user.delete({
           where: {
               id: dAccountant.userId
           }
       });

       return dAccountant;
   });
   
   return deleteAccoutant;
};

export const accountantService = {
    updateCompanyAccountantInDB,
    deleteCompanyAccountantFromDB,
};