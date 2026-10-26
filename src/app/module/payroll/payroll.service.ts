/* eslint-disable @typescript-eslint/no-explicit-any */
import { DepartmentHead, Employee, HrManager } from "../../../generated/prisma/client";
import {
    PayrollStatus,
    Role,
    SalaryType,
    // SubscriptionStatus,
} from "../../../generated/prisma/enums";
import { PayrollWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import {
    // IGeneratePayrollForAllPayload,
    IGeneratePayrollPayload,
    IGetAllOrQueryPayrollsPayload,
    // IPayslipData,
    IUpdatePayrollPayload
} from "./payroll.interface";
import {
    calculateDailyPayroll,
    calculateHourlyPayroll,
    calculateMonthlyPayroll,
    // calculateSalaryPayroll, 
    getMonthRange,
} from "./payroll.utils";


// const generatePayrollForAllEmployeeInDB = async (
//     companyId: string,
//     payload: IGeneratePayrollForAllPayload
// ) => {
//     const { month, year } = payload;

//     // ✅ Validate input
//     const monthNum = Number(month);
//     const yearNum = Number(year);

//     if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
//         throw new Error("Invalid month. Must be between 1 and 12");
//     }

//     // ✅ Check company exists and is active
//     const company = await prisma.company.findUnique({
//         where: { id: companyId },
//         select: {
//             id: true,
//             name: true,
//             subscriptionStatus: true,
//             maxEmployees: true,
//         },
//     });

//     if (!company) {
//         throw new Error("Company not found");
//     }

//     // if (company.subscriptionStatus === SubscriptionStatus.EXPIRED) {
//     //     throw new Error(
//     //         "Company subscription has expired/trial. Please renew your subscription to generate payroll."
//     //     );
//     // }

//     // if (company.subscriptionStatus === SubscriptionStatus.TRIAL) {
//     //     throw new Error(
//     //         "Company subscription is on trial. Please renew your subscription to generate payroll."
//     //     );
//     // }

//     // ✅ Fetch employees ONCE with all needed relations
//     const employees = await prisma.employee.findMany({
//         where: {
//             companyId: companyId,
//         },
//         include: {
//             user: {
//                 select: {
//                     id: true,
//                     name: true,
//                     email: true,
//                 },
//             },
//             designation: true,
//             department: true,
//         },
//     });

//     if (!employees.length) {
//         throw new Error(
//             "No employees found for this company. Please add employees before generating payroll."
//         );
//     }

//     // ✅ Check which employees already have payroll for this period
//     const existingPayrolls = await prisma.payroll.findMany({
//         where: {
//             employeeId: { in: employees.map((e) => e.id) },
//             month: monthNum,
//             year: yearNum,
//         },
//         select: {
//             employeeId: true,
//         },
//     });

//     const existingPayrollEmployeeIds = new Set(
//         existingPayrolls.map((p) => p.employeeId)
//     );

//     // ✅ Filter out employees who already have payroll
//     const employeesToProcess = employees.filter(
//         (emp) => !existingPayrollEmployeeIds.has(emp.id)
//     );

//     if (employeesToProcess.length === 0) {
//         return {
//             success: false,
//             message: "Payroll already generated for all employees for this period",
//             data: {
//                 totalEmployees: employees.length,
//                 alreadyProcessed: existingPayrolls.length,
//                 newlyProcessed: 0,
//                 skipped: existingPayrolls.length,
//                 payrolls: [],
//             },
//         };
//     }

//     // ✅ Calculate all payrolls first (before database operations)
//     const payrollDataList = await Promise.all(
//         employeesToProcess.map(async (employee) => {
//             try {
//                 const payrollData = await calculateSalaryPayroll(
//                     employee,
//                     monthNum,
//                     yearNum
//                 );

//                 return {
//                     employeeId: employee.id,
//                     companyId: companyId,
//                     month: monthNum,
//                     year: yearNum,
//                     ...payrollData,
//                 };
//             } catch (error: any) {
//                 console.error(
//                     `Payroll calculation failed for employee ${employee.id}:`,
//                     error.message
//                 );
//                 // Return null for failed calculations
//                 return null;
//             }
//         })
//     );

//     // ✅ Filter out failed calculations
//     const validPayrollData = payrollDataList.filter(
//         (data): data is NonNullable<typeof data> => data !== null
//     );

//     if (validPayrollData.length === 0) {
//         throw new Error(
//             "Failed to calculate payroll for any employee. Please check employee salary structures."
//         );
//     }

//     // ✅ Use transaction to create all payrolls atomically
//     const createdPayrolls = await prisma.$transaction(
//         validPayrollData.map(
//             (data) =>
//                 prisma.payroll.create({
//                     data: {
//                         ...data,
//                     },
//                     include: {
//                         employee: {
//                             select: {
//                                 id: true,
//                                 user: {
//                                     select: {
//                                         name: true,
//                                         email: true,
//                                     },
//                                 },
//                             },
//                         },
//                     },
//                 })
//         ),
//         {
//             timeout: 30000, // 30 seconds timeout
//             maxWait: 10000, // 10 seconds max wait
//         }
//     );

//     // ✅ Return comprehensive result
//     return {
//         success: true,
//         message: `Payroll generated successfully for ${createdPayrolls.length} employee(s)`,
//         data: {
//             totalEmployees: employees.length,
//             alreadyProcessed: existingPayrolls.length,
//             newlyProcessed: createdPayrolls.length,
//             skipped: existingPayrolls.length,
//             failed: employeesToProcess.length - validPayrollData.length,
//             payrolls: createdPayrolls,
//         },
//     };
// };

// generate payroll for individual employee
const generatePayrollInDB = async (
    companyId: string,
    userId: string,
    payload: IGeneratePayrollPayload
) => {
    const { employeeId, month, year, periodStart, periodEnd } = payload;

    const company = await prisma.company.findUnique({ where: { id: companyId } });
    if (!company) throw new Error("Company not found");

    //* Todo : Add subscription check
    // if (company.subscriptionStatus === SubscriptionStatus.EXPIRED || company.subscriptionStatus === SubscriptionStatus.TRIAL) {
    //     throw new Error("Company subscription has expired/trial. Please renew to generate payroll.");
    // }

    const employee = await prisma.employee.findUnique({
        where: { id: employeeId, companyId },
        include: { user: true, designation: true, department: true },
    });
    if (!employee) throw new Error("Employee not found for this company");

    // Determine Date Range
    let startDate: Date;
    let endDate: Date;

    if (employee.salaryType === SalaryType.MONTHLY) {
        if (!month || !year) throw new Error("Month and year are required for monthly employees");
        const range = getMonthRange(Number(month), Number(year));
        startDate = range.startDate;
        endDate = range.endDate;
    } else {
        if (periodStart && periodEnd) {
            startDate = new Date(periodStart);
            endDate = new Date(periodEnd);
        } else if (month && year) {
            const range = getMonthRange(Number(month), Number(year));
            startDate = range.startDate;
            endDate = range.endDate;
        } else {
            throw new Error("Either (month + year) or (periodStart + periodEnd) is required");
        }
    }

    // Check existing
    const existingPayroll = await prisma.payroll.findFirst({
        where: { employeeId, companyId, periodStart: startDate, periodEnd: endDate },
    });
    if (existingPayroll) {
        throw new Error(`Payroll already generated for this period`);
    }

    // Calculate
    let calculation;
    switch (employee.salaryType) {
        case SalaryType.MONTHLY:
            calculation = await calculateMonthlyPayroll(employee, startDate, endDate);
            break;
        case SalaryType.DAILY:
            calculation = await calculateDailyPayroll(employee, startDate, endDate);
            break;
        case SalaryType.HOURLY:
            calculation = await calculateHourlyPayroll(employee, startDate, endDate);
            break;
        default:
            throw new Error(`Unsupported salary type: ${employee.salaryType}`);
    }

    // Save
    const payroll = await prisma.payroll.create({
        data: {
            employeeId: employee.id,
            companyId,
            periodStart: startDate,
            periodEnd: endDate,
            month: month ? Number(month) : null,
            year: year ? Number(year) : null,
            status: PayrollStatus.DRAFT,
            generatedById: userId,
            // salary calculation data
            salaryType: calculation.salaryType,
            workingDaysPerMonth: calculation.workingDaysPerMonth,
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
            totalDays: calculation.totalDays,
            totalHours: calculation.totalHours,
        },
        include: {
            employee: { select: { id: true, name: true, user: { select: { name: true } } } },
        },
    });

    return payroll;
};
// const generatePayrollInDB = async (companyId: string, userId: string, payload: IGeneratePayrollPayload) => {
//     const { month, year, employeeId } = payload;

//     const isExistCompany = await prisma.company.findUnique({
//         where: {
//             id: companyId,
//         },
//     });

//     if (!isExistCompany) {
//         throw new Error("Company not found");
//     }

//     if (isExistCompany.subscriptionStatus === SubscriptionStatus.EXPIRED) {
//         throw new Error("Company subscription has expired please renew your subscription to generate payroll");
//     }

//     const employeeData = await prisma.employee.findUnique({
//         where: {
//             id: employeeId,
//             companyId: companyId,
//         },
//         include: {
//             user: true,
//             designation: true,
//             department: true,
//         }
//     });

//     if (!employeeData) {
//         throw new Error("Employee not found for the given employeeId and companyId to do payroll generation");
//     }

//     const isExistPayroll = await prisma.payroll.findUnique({
//         where: {
//             employeeId_month_year: {
//                 employeeId: employeeId,
//                 month: Number(month),
//                 year: year,
//             }
//         }
//     });

//     if (isExistPayroll) {
//         throw new Error("Payroll already generated for this employee for the given month and year");
//     }

//     const calculation = await calculateSalaryPayroll(employeeData, month, year);

//     const payroll = await prisma.payroll.create({
//         data: {
//             employeeId: employeeData.id,
//             companyId,
//             month,
//             year,
//             basicSalary: calculation.basicSalary,
//             houseAllowance: calculation.houseAllowance,
//             medicalAllowance: calculation.medicalAllowance,
//             transportAllowance: calculation.transportAllowance,
//             overtimePay: calculation.overtimePay,
//             grossSalary: calculation.grossSalary,
//             taxDeduction: calculation.taxDeduction,
//             pfDeduction: calculation.pfDeduction,
//             otherDeductions: calculation.otherDeductions,
//             totalDeductions: calculation.totalDeductions,
//             netSalary: calculation.netSalary,
//             status: PayrollStatus.DRAFT,
//             generatedById: userId
//         },
//     });

//     return payroll;
// }


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
        salaryType,
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

    // Salary Type filter
    if (salaryType) {
        addCondition.push({
            salaryType: salaryType,
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
                },
                company: true,
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
                        },
                    }
                },
                company: true,
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
                },
                company: true,
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
                },
                company: true,
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
    userId: string, // For audit logging if needed later
    payrollId: string,
    payload: IUpdatePayrollPayload
) => {
    // 1. Verify the payroll exists and belongs to the company
    const existingPayroll = await prisma.payroll.findUnique({
        where: { id: payrollId },
        include: {
            employee: { select: { name: true } },
        },
    });

    if (!existingPayroll) {
        throw new Error("Payroll record not found");
    }

    if (existingPayroll.companyId !== companyId) {
        throw new Error("Unauthorized: You do not have access to this payroll record");
    }

    // 2. Prevent editing if already PAID or CANCELLED (Optional but recommended)
    // if (existingPayroll.status === PayrollStatus.PAID) {
    //     throw new Error("Cannot edit a payroll that has already been paid");
    // }
    // if (existingPayroll.status === PayrollStatus.CANCELLED) {
    //     throw new Error("Cannot edit a cancelled payroll");
    // }

    // 3. Prepare the update data
    const updateData: any = {};

    if (payload.month !== undefined) {
        updateData.month = payload.month ? Number(payload.month) : null;
    }
    if (payload.year !== undefined) {
        updateData.year = payload.year ? Number(payload.year) : null;
    }
    if (payload.periodStart) {
        updateData.periodStart = new Date(payload.periodStart);
    }
    if (payload.periodEnd) {
        updateData.periodEnd = new Date(payload.periodEnd);
    }
    if (payload.status) {
        updateData.status = payload.status;
    }

    // 4. Handle PaidAt logic based on status
    if (payload.status !== PayrollStatus.PAID) {
        // If moving away from PAID, clear the paidAt date
        updateData.paidAt = null;
    }
    else if (payload.status === PayrollStatus.PAID) {
        // If marking as PAID, use provided date or default to now
        updateData.paidAt = payload.paidAt ? new Date(payload.paidAt) : new Date();
    } else if (payload.paidAt !== undefined) {
        // If just updating the date directly
        updateData.paidAt = payload.paidAt ? new Date(payload.paidAt) : null;
    }

    // 5. Execute the update
    const updatedPayroll = await prisma.payroll.update({
        where: { id: payrollId },
        data: updateData,
        include: {
            employee: {
                select: {
                    id: true,
                    name: true,
                    employeeCode: true,
                    user: { select: { name: true, email: true } },
                },
            },
        },
    });

    return updatedPayroll;
};

// const getPayslipDataFromDB = async (
//     payrollId: string,
//     companyId: string,
//     userId: string,
//     role: Role
// ) => {
//     const payroll = await prisma.payroll.findFirst({
//         where: {
//             id: payrollId,
//             companyId
//         },
//         include: {
//             employee: {
//                 include: {
//                     department: true,
//                     designation: true,
//                     user: true
//                 }
//             }
//         }
//     });

//     if (!payroll) {
//         throw new Error("Payroll not found");
//     }

//     // Check permission for EMPLOYEE
//     if (role === Role.EMPLOYEE) {
//         const employee = await prisma.employee.findUnique({
//             where: { userId }
//         });
//         if (payroll.employeeId !== employee?.id) {
//             throw new Error("You can only view your own payslip");
//         }
//     }

//     // Check permission for DEPARTMENT_HEAD
//     if (role === Role.DEPARTMENT_HEAD) {
//         const deptHead = await prisma.departmentHead.findUnique({
//             where: { userId }
//         });
//         if (payroll.employee.departmentId !== deptHead?.departmentId) {
//             throw new Error("You can only view payslip for your department");
//         }
//     }

//     // Check permission for HR_MANAGER
//     if (role === Role.HR_MANAGER) {
//         const hrManager = await prisma.hrManager.findUnique({
//             where: { userId }
//         });
//         if (hrManager?.scope === 'DEPARTMENT_SPECIFIC' &&
//             hrManager.departmentId &&
//             payroll.employee.departmentId !== hrManager.departmentId) {
//             throw new Error("You can only view payslip for your assigned department");
//         }
//     }

//     const payslipData: IPayslipData = {
//         employeeName: payroll.employee.user.name,
//         employeeCode: payroll.employee.employeeCode || 'N/A',
//         department: payroll.employee.department?.name || 'N/A',
//         designation: payroll.employee.designation?.title || 'N/A',
//         month: payroll.month,
//         year: payroll.year,
//         basicSalary: payroll.basicSalary,
//         houseAllowance: payroll.houseAllowance,
//         medicalAllowance: payroll.medicalAllowance,
//         transportAllowance: payroll.transportAllowance,
//         overtimePay: payroll.overtimePay,
//         grossSalary: payroll.grossSalary,
//         taxDeduction: payroll.taxDeduction,
//         pfDeduction: payroll.pfDeduction,
//         otherDeductions: payroll.otherDeductions,
//         totalDeductions: payroll.totalDeductions,
//         netSalary: payroll.netSalary,
//         status: payroll.status,
//         paidAt: payroll.paidAt || undefined,
//         generatedAt: payroll.createdAt
//     };

//     return payslipData;
// };

export const payrollService = {
    generatePayrollInDB,
    // generatePayrollForAllEmployeeInDB,
    getAllOrQueryPayrollsFromDB,
    updatePayrollInDB,
    // getPayslipDataFromDB,
}