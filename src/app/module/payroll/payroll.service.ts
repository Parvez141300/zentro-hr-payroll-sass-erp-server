import { DepartmentHead, Employee, HrManager } from "../../../generated/prisma/client";
import { PayrollStatus, Role, SubscriptionStatus } from "../../../generated/prisma/enums";
import { PayrollWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IGeneratePayrollPayload, IGetAllOrQueryPayrollsPayload, IPayslipData, IUpdatePayrollPayload } from "./payroll.interface";
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

const getAllOrQueryPayrollsFromDB = async (
    companyId: string,
    userId: string,
    role: Role,
    payload: IGetAllOrQueryPayrollsPayload
) => {
    const {
        search,
        page = 1,
        skip = 0,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        month,
        year,
        status,
        startDate,
        endDate,
        departmentId,
        designationId,
    } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: { id: companyId }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistUser = await prisma.user.findUnique({
        where: { id: userId }
    });

    if (!isExistUser) {
        throw new Error("User not found");
    }

    let employeeData: Employee | null = null;
    let hrManagerData: HrManager | null = null;
    let departmentHeadData: DepartmentHead | null = null;

    if (role === Role.EMPLOYEE) {
        employeeData = await prisma.employee.findUnique({
            where: {
                companyId: companyId,
                userId: userId,
            }
        });

        if (!employeeData) {
            throw new Error("Employee not found");
        }
    }

    if (role === Role.DEPARTMENT_HEAD) {
        departmentHeadData = await prisma.departmentHead.findUnique({
            where: {
                companyId: companyId,
                userId: userId,
            }
        });

        if (!departmentHeadData) {
            throw new Error("Department Head not found");
        }
    }

    if (role === Role.HR_MANAGER) {
        hrManagerData = await prisma.hrManager.findUnique({
            where: {
                companyId: companyId,
                userId: userId,
            }
        });

        if (!hrManagerData) {
            throw new Error("HR Manager not found");
        }
    }

    const addCondition: PayrollWhereInput[] = [];

    // Search filter (employee name, email, code)
    if (search) {
        addCondition.push({
            OR: [
                {
                    employee: {
                        user: {
                            name: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    }
                },
                {
                    employee: {
                        user: {
                            email: {
                                contains: search,
                                mode: "insensitive"
                            }
                        }
                    }
                },
                {
                    employee: {
                        employeeCode: {
                            contains: search,
                            mode: "insensitive"
                        }
                    }
                },
            ]
        });
    }

    // Month filter
    if (month) {
        addCondition.push({
            month: month
        });
    }

    // Year filter
    if (year) {
        addCondition.push({
            year: year
        });
    }

    // Status filter
    if (status) {
        addCondition.push({
            status: status
        });
    }

    // Date range filter (createdAt)
    if (startDate && endDate) {
        addCondition.push({
            createdAt: {
                gte: startDate,
                lte: endDate
            }
        });
    }

    let payrolls;
    let payrollCount: number;

    // 🔹 EMPLOYEE: See only their own payroll
    if (role === Role.EMPLOYEE) {
        const whereCondition = {
            employeeId: employeeData?.id,
            companyId: companyId,
            AND: addCondition,
        };

        payrolls = await prisma.payroll.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        department: true,
                        designation: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        payrollCount = await prisma.payroll.count({
            where: whereCondition
        });
    }

    // 🔹 DEPARTMENT_HEAD: See only their department's payroll
    else if (role === Role.DEPARTMENT_HEAD) {
        const whereCondition = {
            employee: {
                departmentId: departmentHeadData?.departmentId,
            },
            companyId: companyId,
            AND: addCondition,
        };

        payrolls = await prisma.payroll.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        department: true,
                        designation: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        payrollCount = await prisma.payroll.count({
            where: whereCondition
        });
    }

    // 🔹 HR_MANAGER (Department Specific): See only that department's payroll
    else if (
        role === Role.HR_MANAGER &&
        hrManagerData?.scope === 'DEPARTMENT_SPECIFIC' &&
        hrManagerData?.departmentId
    ) {
        const whereCondition = {
            employee: {
                departmentId: hrManagerData?.departmentId,
            },
            companyId: companyId,
            AND: addCondition,
        };

        payrolls = await prisma.payroll.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        department: true,
                        designation: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        payrollCount = await prisma.payroll.count({
            where: whereCondition
        });
    }

    // 🔹 SUPER_ADMIN, HR_MANAGER (Company Wide), ACCOUNTANT: See all
    else {
        // Add department filter if provided
        if (departmentId) {
            addCondition.push({
                employee: {
                    departmentId: departmentId
                }
            });
        }

        // Add designation filter if provided
        if (designationId) {
            addCondition.push({
                employee: {
                    designationId: designationId
                }
            });
        }

        const whereCondition = {
            companyId: companyId,
            AND: addCondition,
        };

        payrolls = await prisma.payroll.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        department: true,
                        designation: true,
                        user: {
                            select: {
                                id: true,
                                email: true,
                                name: true
                            }
                        }
                    }
                }
            }
        });

        payrollCount = await prisma.payroll.count({
            where: whereCondition
        });
    }

    return {
        data: payrolls,
        pagination: {
            total: payrollCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(payrollCount / limit),
        }
    };
};

const updatePayrollInDB = async (
    companyId: string,
    payrollId: string,
    payload: IUpdatePayrollPayload,
) => {
    const {
        basicSalary,
        houseAllowance,
        medicalAllowance,
        transportAllowance,
        overtimePay,
        taxDeduction,
        pfDeduction,
        otherDeductions,
        status
    } = payload;

    const isExistPayroll = await prisma.payroll.findFirst({
        where: {
            id: payrollId,
            companyId
        },
        include: {
            employee: true
        }
    });

    if (!isExistPayroll) {
        throw new Error("Payroll not found");
    }

    // Cannot update if already paid
    if (isExistPayroll.status === 'PAID') {
        throw new Error("Cannot update a paid payroll");
    }

    // Calculate new values
    const newBasicSalary = basicSalary ?? isExistPayroll.basicSalary;
    const newHouseAllowance = houseAllowance ?? isExistPayroll.houseAllowance;
    const newMedicalAllowance = medicalAllowance ?? isExistPayroll.medicalAllowance;
    const newTransportAllowance = transportAllowance ?? isExistPayroll.transportAllowance;
    const newOvertimePay = overtimePay ?? isExistPayroll.overtimePay;
    const newTaxDeduction = taxDeduction ?? isExistPayroll.taxDeduction;
    const newPfDeduction = pfDeduction ?? isExistPayroll.pfDeduction;
    const newOtherDeductions = otherDeductions ?? isExistPayroll.otherDeductions;

    const grossSalary = newBasicSalary + newHouseAllowance + newMedicalAllowance +
        newTransportAllowance + newOvertimePay;
    const totalDeductions = newTaxDeduction + newPfDeduction + newOtherDeductions;
    const netSalary = grossSalary - totalDeductions;

    const updated = await prisma.payroll.update({
        where: { id: payrollId },
        data: {
            basicSalary: newBasicSalary,
            houseAllowance: newHouseAllowance,
            medicalAllowance: newMedicalAllowance,
            transportAllowance: newTransportAllowance,
            overtimePay: newOvertimePay,
            grossSalary,
            taxDeduction: newTaxDeduction,
            pfDeduction: newPfDeduction,
            otherDeductions: newOtherDeductions,
            totalDeductions,
            netSalary,
            status: status || isExistPayroll.status,
        },
    });

    return updated;
};

const getPayslipDataFromDB = async (
    payrollId: string,
    companyId: string,
    userId: string,
    role: Role
) => {
    const payroll = await prisma.payroll.findFirst({
        where: {
            id: payrollId,
            companyId
        },
        include: {
            employee: {
                include: {
                    department: true,
                    designation: true,
                    user: true
                }
            }
        }
    });

    if (!payroll) {
        throw new Error("Payroll not found");
    }

    // Check permission for EMPLOYEE
    if (role === Role.EMPLOYEE) {
        const employee = await prisma.employee.findUnique({
            where: { userId }
        });
        if (payroll.employeeId !== employee?.id) {
            throw new Error("You can only view your own payslip");
        }
    }

    // Check permission for DEPARTMENT_HEAD
    if (role === Role.DEPARTMENT_HEAD) {
        const deptHead = await prisma.departmentHead.findUnique({
            where: { userId }
        });
        if (payroll.employee.departmentId !== deptHead?.departmentId) {
            throw new Error("You can only view payslip for your department");
        }
    }

    // Check permission for HR_MANAGER
    if (role === Role.HR_MANAGER) {
        const hrManager = await prisma.hrManager.findUnique({
            where: { userId }
        });
        if (hrManager?.scope === 'DEPARTMENT_SPECIFIC' &&
            hrManager.departmentId &&
            payroll.employee.departmentId !== hrManager.departmentId) {
            throw new Error("You can only view payslip for your assigned department");
        }
    }

    const payslipData: IPayslipData = {
        employeeName: payroll.employee.user.name,
        employeeCode: payroll.employee.employeeCode || 'N/A',
        department: payroll.employee.department?.name || 'N/A',
        designation: payroll.employee.designation?.title || 'N/A',
        month: payroll.month,
        year: payroll.year,
        basicSalary: payroll.basicSalary,
        houseAllowance: payroll.houseAllowance,
        medicalAllowance: payroll.medicalAllowance,
        transportAllowance: payroll.transportAllowance,
        overtimePay: payroll.overtimePay,
        grossSalary: payroll.grossSalary,
        taxDeduction: payroll.taxDeduction,
        pfDeduction: payroll.pfDeduction,
        otherDeductions: payroll.otherDeductions,
        totalDeductions: payroll.totalDeductions,
        netSalary: payroll.netSalary,
        status: payroll.status,
        paidAt: payroll.paidAt || undefined,
        generatedAt: payroll.createdAt
    };

    return payslipData;
};

export const payrollService = {
    generatePayrollInDB,
    getAllOrQueryPayrollsFromDB,
    updatePayrollInDB,
    getPayslipDataFromDB,
}