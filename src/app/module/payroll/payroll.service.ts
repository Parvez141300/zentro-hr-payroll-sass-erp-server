import { PayrollStatus, SubscriptionStatus } from "../../../generated/prisma/enums";
import { prisma } from "../../lib/prisma";
import { IGeneratePayrollPayload } from "./payroll.interface";
import { calculateSalaryPayroll } from "./payroll.utils";

const generatePayrollInDB = async (companyId: string, userId: string, payload: IGeneratePayrollPayload) => {
    const { month, year, employeeId } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId,
        },
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    if (isExistCompany.subscriptionStatus === SubscriptionStatus.EXPIRED) {
        throw new Error("Company subscription has expired please renew your subscription to generate payroll");
    }

    const employeeData = await prisma.employee.findUnique({
        where: {
            id: employeeId,
            companyId: companyId,
        },
        include: {
            user: true,
            designation: true,
            department: true,
        }
    });

    if (!employeeData) {
        throw new Error("Employee not found for the given employeeId and companyId to do payroll generation");
    }

    const isExistPayroll = await prisma.payroll.findUnique({
        where: {
            employeeId_month_year: {
                employeeId: employeeId,
                month: month,
                year: year,
            }
        }
    });

    if (isExistPayroll) {
        throw new Error("Payroll already generated for this employee for the given month and year");
    }

    const calculation = await calculateSalaryPayroll(employeeData, month, year);

    const payroll = await prisma.payroll.create({
        data: {
            employeeId: employeeData.id,
            companyId,
            month,
            year,
            basicSalary: calculation.basicSalary,
            houseAllowance: calculation.houseAllowance,
            medicalAllowance: calculation.medicalAllowance,
            transportAllowance: calculation.transportAllowance,
            overtimePay: calculation.overtimePay,
            grossSalary: calculation.grossSalary,
            taxDeduction: calculation.taxDeduction,
            pfDeduction: calculation.pfDeduction,
            otherDeductions: calculation.otherDeductions,
            totalDeductions: calculation.totalDeductions,
            netSalary: calculation.netSalary,
            status: PayrollStatus.DRAFT,
            generatedById: userId
        },
    });

    return payroll;
}

export const payrollService = {
    generatePayrollInDB,
}