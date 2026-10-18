import { AttendanceStatus, Employee, SalaryType } from "../../../generated/prisma/client";
import { prisma } from "../../lib/prisma";

// ============================================
// ✅ Constants
// ============================================
const WORKING_HOURS_PER_DAY = 8;
const OVERTIME_MULTIPLIER = 1.5;
const PF_DEDUCTION_PERCENTAGE = 0.10;

// ✅ Helper: Date Range
const getMonthRange = (month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return { startDate, endDate };
};

// ✅ Helper: Tax Calculation (Bangladesh)
const calculateTax = (monthlyGross: number): number => {
    const yearlyGross = monthlyGross * 12;
    let yearlyTax = 0;

    if (yearlyGross > 350000) {
        if (yearlyGross <= 450000) {
            yearlyTax = (yearlyGross - 350000) * 0.05;
        } else if (yearlyGross <= 750000) {
            yearlyTax = 5000 + (yearlyGross - 450000) * 0.10;
        } else if (yearlyGross <= 1150000) {
            yearlyTax = 35000 + (yearlyGross - 750000) * 0.15;
        } else if (yearlyGross <= 1650000) {
            yearlyTax = 95000 + (yearlyGross - 1150000) * 0.20;
        } else {
            yearlyTax = 195000 + (yearlyGross - 1650000) * 0.25;
        }
    }
    return yearlyTax / 12;
};

const calculateMonthlyPayroll = async (employee: Employee, startDate: Date, endDate: Date) => {
    const monthlyBasic = employee.basicSalary || 0;
    const workingDays = employee.workingDaysPerMonth || 22;
    const salaryPerDay = monthlyBasic / workingDays;

    // Fixed allowances from employee data
    const fixedHouse = employee.houseAllowance || 0;
    const fixedMedical = employee.medicalAllowance || 0;
    const fixedTransport = employee.transportAllowance || 0;

    const attendances = await prisma.attendance.findMany({
        where: {
            employeeId: employee.id,
            companyId: employee.companyId,
            date: { gte: startDate, lte: endDate },
        },
    });

    let presentDays = 0;
    let totalOvertimeHours = 0;

    for (const att of attendances) {
        if (att.status === AttendanceStatus.PRESENT || att.status === AttendanceStatus.LEAVE || att.status === AttendanceStatus.LATE) {
            presentDays += 1;
        } else if (att.status === AttendanceStatus.HALF_DAY) {
            presentDays += 0.5;
        }
        totalOvertimeHours += att.overtimeHours || 0;
    }

    // If no attendance tracked, assume full month
    const effectivePresentDays = attendances.length > 0 ? presentDays : workingDays;
    const dayRatio = effectivePresentDays / workingDays; // e.g., 20/22

    // Pro-rated based on attendance
    const basicSalary = salaryPerDay * effectivePresentDays;
    const houseAllowance = fixedHouse * dayRatio;
    const medicalAllowance = fixedMedical * dayRatio;
    const transportAllowance = fixedTransport * dayRatio;

    const hourlyRate = salaryPerDay / WORKING_HOURS_PER_DAY;
    const overtimePay = totalOvertimeHours * hourlyRate * OVERTIME_MULTIPLIER;

    const grossSalary = basicSalary + houseAllowance + medicalAllowance + transportAllowance + overtimePay;

    const taxDeduction = calculateTax(grossSalary);
    const pfDeduction = basicSalary * PF_DEDUCTION_PERCENTAGE;
    const totalDeductions = taxDeduction + pfDeduction;
    const netSalary = grossSalary - totalDeductions;

    return {
        salaryType: SalaryType.MONTHLY,
        workingDaysPerMonth: workingDays,
        basicSalary: Math.round(basicSalary * 100) / 100,
        houseAllowance: Math.round(houseAllowance * 100) / 100,
        medicalAllowance: Math.round(medicalAllowance * 100) / 100,
        transportAllowance: Math.round(transportAllowance * 100) / 100,
        overtimePay: Math.round(overtimePay * 100) / 100,
        grossSalary: Math.round(grossSalary * 100) / 100,
        taxDeduction: Math.round(taxDeduction * 100) / 100,
        pfDeduction: Math.round(pfDeduction * 100) / 100,
        otherDeductions: 0,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netSalary: Math.round(netSalary * 100) / 100,
        totalDays: Math.floor(effectivePresentDays),
        totalHours: totalOvertimeHours + (effectivePresentDays * WORKING_HOURS_PER_DAY),
    };
};

// ============================================
// 2️⃣ DAILY Employee
// ============================================
const calculateDailyPayroll = async (employee: Employee, startDate: Date, endDate: Date) => {
    // For DAILY, basicSalary is the per-day rate
    const dailyRate = employee.basicSalary || 0;

    // Fixed allowances are treated as MONTHLY values, so we calculate their daily rate
    const workingDays = employee.workingDaysPerMonth || 22;
    const dailyHouse = (employee.houseAllowance || 0) / workingDays;
    const dailyMedical = (employee.medicalAllowance || 0) / workingDays;
    const dailyTransport = (employee.transportAllowance || 0) / workingDays;

    const attendances = await prisma.attendance.findMany({
        where: {
            employeeId: employee.id,
            companyId: employee.companyId,
            date: { gte: startDate, lte: endDate },
        },
    });

    let presentDays = 0;
    let totalOvertimeHours = 0;

    for (const att of attendances) {
        if (att.status === AttendanceStatus.PRESENT || att.status === AttendanceStatus.LEAVE || att.status === AttendanceStatus.LATE) {
            presentDays += 1;
        } else if (att.status === AttendanceStatus.HALF_DAY) {
            presentDays += 0.5;
        }
        totalOvertimeHours += att.overtimeHours || 0;
    }

    const basicSalary = dailyRate * presentDays;
    const houseAllowance = dailyHouse * presentDays;
    const medicalAllowance = dailyMedical * presentDays;
    const transportAllowance = dailyTransport * presentDays;

    const hourlyRate = dailyRate / WORKING_HOURS_PER_DAY;
    const overtimePay = totalOvertimeHours * hourlyRate * OVERTIME_MULTIPLIER;

    const grossSalary = basicSalary + houseAllowance + medicalAllowance + transportAllowance + overtimePay;

    // To calculate tax correctly for daily workers, we estimate monthly gross
    const estimatedMonthlyGross = grossSalary * (workingDays / (presentDays || 1));
    const taxDeduction = calculateTax(estimatedMonthlyGross) * (presentDays / workingDays);

    const pfDeduction = basicSalary * PF_DEDUCTION_PERCENTAGE;
    const totalDeductions = taxDeduction + pfDeduction;
    const netSalary = grossSalary - totalDeductions;

    return {
        salaryType: SalaryType.DAILY,
        workingDaysPerMonth: workingDays,
        basicSalary: Math.round(basicSalary * 100) / 100,
        houseAllowance: Math.round(houseAllowance * 100) / 100,
        medicalAllowance: Math.round(medicalAllowance * 100) / 100,
        transportAllowance: Math.round(transportAllowance * 100) / 100,
        overtimePay: Math.round(overtimePay * 100) / 100,
        grossSalary: Math.round(grossSalary * 100) / 100,
        taxDeduction: Math.round(taxDeduction * 100) / 100,
        pfDeduction: Math.round(pfDeduction * 100) / 100,
        otherDeductions: 0,
        totalDeductions: Math.round(totalDeductions * 100) / 100,
        netSalary: Math.round(netSalary * 100) / 100,
        totalDays: Math.floor(presentDays),
        totalHours: totalOvertimeHours + (presentDays * WORKING_HOURS_PER_DAY),
    };
};

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
    };
}