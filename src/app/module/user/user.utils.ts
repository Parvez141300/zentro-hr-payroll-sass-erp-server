import { Role } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma"

export const generateEmployeeCode = async (role: Role, companyId: string) => {

    let count = 0;
    switch (role) {
        case Role.HR_MANAGER:
            count = await prisma.hrManager.count({
                where: {
                    companyId: companyId
                }
            });

            return `HR-${String(count + 1).padStart(4, '0')}`;

        case Role.DEPARTMENT_HEAD:
            count = await prisma.departmentHead.count({
                where: {
                    companyId: companyId
                }
            });

            return `DH-${String(count + 1).padStart(4, '0')}`;

        case Role.ACCOUNTANT:
            count = await prisma.accountant.count({
                where: {
                    companyId: companyId
                }
            });

            return `AC-${String(count + 1).padStart(4, '0')}`;

        case Role.EMPLOYEE:
            count = await prisma.employee.count({
                where: {
                    companyId: companyId
                }
            });

            return `EM-${String(count + 1).padStart(4, '0')}`;

        default:
            return `EM-${String(count + 1).padStart(4, '0')}`;
    }
}