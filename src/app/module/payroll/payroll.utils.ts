import { AttendanceStatus, Employee } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

export const calculateSalaryPayroll = async (employee: Employee, month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1); // First day of the month
    const endDate = new Date(year, month, 0); // Last day of the month

    const basicSalary = employee.basicSalary || 0;
    const houseAllowance = employee.houseAllowance || basicSalary * 0.5;
    const medicalAllowance = employee.medicalAllowance || basicSalary * 0.1;
    const transportAllowance = employee.transportAllowance || basicSalary * 0.08;

    const attendances = await prisma.attendance.findMany({
        where: {
            employeeId: employee.id,
            companyId: employee.companyId,
            date: {
                gte: startDate,
                lte: endDate,
            },
            status: AttendanceStatus.PRESENT, // Only consider present days for salary calculation
        },
    });

    let totalOvertimeHours = 0;

    for (const attendance of attendances) {
        if (attendance.overtimeHours) {
            totalOvertimeHours += attendance.overtimeHours;
        }
    }

    // Overtime rate: 1.5x of hourly rate
    // Hourly rate = (Basic Salary / 22 working days) / 8 hours
    const dailyRate = basicSalary / 22; // 22 working days in a month
    const hourlyRate = dailyRate / 8; // 8 hours per day
    const overtimePay = totalOvertimeHours * hourlyRate * 1.5;

    // tottal or gross salary
    const grossSalary = basicSalary + houseAllowance + medicalAllowance +
        transportAllowance + overtimePay;

    // Calculate tax deduction based on Bangladesh Income Tax Slabs (2023-2024)
    let taxDeduction = 0;
    const yearlyGross = grossSalary * 12;

    // Bangladesh Income Tax Slabs (2023-2024)
    if (yearlyGross > 350000) {
        if (yearlyGross <= 450000) {
            taxDeduction = (yearlyGross - 350000) * 0.05 / 12;
        } else if (yearlyGross <= 750000) {
            taxDeduction = (5000 + (yearlyGross - 450000) * 0.10) / 12;
        } else if (yearlyGross <= 1150000) {
            taxDeduction = (35000 + (yearlyGross - 750000) * 0.15) / 12;
        } else if (yearlyGross <= 1650000) {
            taxDeduction = (95000 + (yearlyGross - 1150000) * 0.20) / 12;
        } else {
            taxDeduction = (195000 + (yearlyGross - 1650000) * 0.25) / 12;
        }
    }

    // PF Deduction: 10% of basic salary
    const pfDeduction = basicSalary * 0.10;

    // Other deductions (loan, advance, etc.)
    const otherDeductions = 0;

    const totalDeductions = taxDeduction + pfDeduction + otherDeductions;

    // Net Salary
    const netSalary = grossSalary - totalDeductions;

    return {
        basicSalary,
        houseAllowance,
        medicalAllowance,
        transportAllowance,
        overtimePay,
        grossSalary,
        taxDeduction,
        pfDeduction,
        otherDeductions,
        totalDeductions,
        netSalary,
        totalOvertimeHours
    };
}