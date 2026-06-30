import { DepartmentHead, Employee, HrManager } from "../../../generated/prisma/client";
import { HrScope, LeaveStatus, Role } from "../../../generated/prisma/enums";
import { LeaveUpdateInput, LeaveWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { IApplyForLeavePayload, IEmployeeLeaveUpdatePayload, IGetAllOrQueryLeavesPayload, IUpdateLeavePayload } from "./leave.interface"
import { totalDaysForLeaveCalculation } from "./leave.utils";

const applyForLeaveInDB = async (companyId: string, userId: string, payload: IApplyForLeavePayload) => {
    const { leaveTypeId, startDate, endDate, reason, attachmentUrl } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found for apply leave");
    }

    const isExistEmployee = await prisma.employee.findUnique({
        where: {
            id: userId,
            companyId: companyId
        }
    });

    if (!isExistEmployee) {
        throw new Error("User not found for apply leave");
    }

    const isExistLeaveType = await prisma.leaveType.findUnique({
        where: {
            id: leaveTypeId,
            companyId: companyId
        }
    });

    if (!isExistLeaveType) {
        throw new Error("Leave type not found for apply leave");
    }

    const totalDays = totalDaysForLeaveCalculation(startDate, endDate);

    if (totalDays > isExistLeaveType.daysAllowed) {
        throw new Error("Your Leave is not allowed because you have exceeded the number of days allowed for this leave type.");
    }

    const leave = await prisma.leave.create({
        data: {
            companyId: isExistCompany.id,
            employeeId: isExistEmployee.id,
            leaveTypeId: leaveTypeId,
            startDate: startDate,
            endDate: endDate,
            totalDays: totalDays,
            reason: reason,
            attachmentUrl: attachmentUrl || null,
        }
    });

    return leave;
}

const getAllOrQueryLeavesFromDB = async (
    companyId: string,
    userId: string,
    role: Role,
    payload: IGetAllOrQueryLeavesPayload
) => {
    const {
        search,
        page = 1,
        skip = 0,
        limit = 10,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        startDate,
        endDate,
        status,
        leaveTypeId,
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

    const addCondition: LeaveWhereInput[] = [];

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

    // Date range filter
    if (startDate && endDate) {
        addCondition.push({
            OR: [
                {
                    startDate: {
                        gte: startDate,
                        lte: endDate
                    }
                },
                {
                    endDate: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            ]
        });
    }

    // Status filter
    if (status) {
        addCondition.push({
            status: status
        });
    }

    // Leave type filter
    if (leaveTypeId) {
        addCondition.push({
            leaveTypeId: leaveTypeId
        });
    }


    let leaves;
    let leaveCount: number;

    // 🔹 EMPLOYEE: See only their own leaves
    if (role === Role.EMPLOYEE) {
        const whereCondition = {
            employeeId: employeeData?.id,
            companyId: companyId,
            AND: addCondition,
        };

        leaves = await prisma.leave.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        user: true,
                        department: true,
                        designation: true
                    }
                },
                leaveType: true
            }
        });

        leaveCount = await prisma.leave.count({
            where: whereCondition
        });
    }

    // 🔹 DEPARTMENT_HEAD: See only their department's leaves
    else if (role === Role.DEPARTMENT_HEAD) {
        const whereCondition = {
            employee: {
                departmentId: departmentHeadData?.departmentId,
            },
            companyId: companyId,
            AND: addCondition,
        };

        leaves = await prisma.leave.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        user: true,
                        department: true,
                        designation: true
                    }
                },
                leaveType: true
            }
        });

        leaveCount = await prisma.leave.count({
            where: whereCondition
        });
    }

    // 🔹 HR_MANAGER (Department Specific): See only that department's leaves
    else if (
        role === Role.HR_MANAGER &&
        hrManagerData?.scope === HrScope.DEPARTMENT_SPECIFIC &&
        hrManagerData?.departmentId
    ) {
        const whereCondition = {
            employee: {
                departmentId: hrManagerData?.departmentId,
            },
            companyId: companyId,
            AND: addCondition,
        };

        leaves = await prisma.leave.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        user: true,
                        department: true,
                        designation: true
                    }
                },
                leaveType: true
            }
        });

        leaveCount = await prisma.leave.count({
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

        leaves = await prisma.leave.findMany({
            where: whereCondition,
            skip: skip,
            take: limit,
            orderBy: {
                [sortBy]: sortOrder
            },
            include: {
                employee: {
                    include: {
                        user: true,
                        department: true,
                        designation: true
                    }
                },
                leaveType: true
            }
        });

        leaveCount = await prisma.leave.count({
            where: whereCondition
        });
    }

    return {
        data: leaves,
        pagination: {
            total: leaveCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(leaveCount / limit),
        },
    };
};

const employeeLeaveUpdateInDB = async (companyId: string, leaveId: string, payload: IEmployeeLeaveUpdatePayload) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistLeave = await prisma.leave.findUnique({
        where: {
            id: leaveId,
            employee: {
                companyId: companyId
            },
        },
    });

    if (!isExistLeave) {
        throw new Error("Leave not found");
    }

    if (payload.status && payload.status !== LeaveStatus.CANCELLED) {
        throw new Error("Only cancelled leave can be updated by employee");
    }

    const updateLeave = await prisma.leave.update({
        where: {
            id: leaveId,
            employee: {
                companyId: companyId
            },
        },
        data: {
            ...payload,
        },
    });

    return updateLeave;
};

const updateLeaveInDB = async (companyId: string, userId: string, leaveId: string, role: Role, payload: IUpdateLeavePayload) => {
    const {
        status,
        reviewNote,
        rejectedReason
    } = payload;

    const isExistCompany = await prisma.company.findUnique({
        where: { id: companyId }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistLeave = await prisma.leave.findFirst({
        where: {
            id: leaveId,
            companyId: companyId,
        },
        include: {
            employee: {
                include: {
                    department: true,
                    user: true
                }
            },
            leaveType: true
        }
    });

    if (!isExistLeave) {
        throw new Error("Leave not found");
    }

    // ❌ Employee cannot update leave
    if (role === Role.EMPLOYEE) {
        throw new Error("Employees cannot update leave status");
    }

    // 🔹 DEPARTMENT_HEAD: Can only update leaves from their department
    if (role === Role.DEPARTMENT_HEAD) {
        const departmentHead = await prisma.departmentHead.findUnique({
            where: { userId: userId }
        });

        if (!departmentHead) {
            throw new Error("Department Head not found");
        }

        const allowedDepartmentId = departmentHead.departmentId;

        // Check if this leave belongs to their department
        if (isExistLeave.employee.departmentId !== allowedDepartmentId) {
            throw new Error("You can only update leave requests from your own department");
        }
    }

    // 🔹 HR_MANAGER: Can update based on scope
    else if (role === Role.HR_MANAGER) {
        const hrManager = await prisma.hrManager.findUnique({
            where: { userId: userId }
        });

        if (!hrManager) {
            throw new Error("HR Manager not found");
        }

        // Department-specific HR: Only their department
        if (hrManager.scope === HrScope.DEPARTMENT_SPECIFIC && hrManager.departmentId) {
            const allowedDepartmentId = hrManager.departmentId;

            if (isExistLeave.employee.departmentId !== allowedDepartmentId) {
                throw new Error("You can only update leave requests from your assigned department");
            }
        }
        // COMPANY_WIDE HR: Can update all departments (allowedDepartmentId stays null)
    }

    // 🔹 SUPER_ADMIN: Can update anything (allowedDepartmentId stays null)

    const updateData: LeaveUpdateInput = {
        reviewedById: userId,
    };

    // Update status
    if (status) {
        updateData.status = status;
    }

    // Update review note
    if (reviewNote) {
        updateData.reviewNote = reviewNote;
    }

    // Update rejection reason
    if (rejectedReason) {
        updateData.rejectedReason = rejectedReason;
    }

    // Update timestamps based on status
    if (status === LeaveStatus.APPROVED_BY_HEAD) {
        updateData.approvedByHeadAt = new Date();
        updateData.approvedByHRAt = null;
        updateData.rejectedAt = null;
        updateData.rejectedReason = null;
    }

    if (status === LeaveStatus.APPROVED) {
        updateData.approvedByHRAt = new Date();
        updateData.rejectedAt = null;
        updateData.rejectedReason = null;
    }

    if (status === LeaveStatus.REJECTED) {
        updateData.rejectedAt = new Date();
        updateData.approvedByHeadAt = null;
        updateData.approvedByHRAt = null;
    }

    if (status === LeaveStatus.PENDING) {
        updateData.approvedByHeadAt = null;
        updateData.approvedByHRAt = null;
        updateData.rejectedAt = null;
        updateData.rejectedReason = null;
    }

    if (status === LeaveStatus.CANCELLED) {
        updateData.approvedByHeadAt = null;
        updateData.approvedByHRAt = null;
        updateData.rejectedAt = null;
        updateData.rejectedReason = null;
    }

    const updatedLeave = await prisma.leave.update({
        where: { id: leaveId },
        data: updateData,
        include: {
            employee: {
                include: {
                    department: true,
                    user: true
                }
            },
            leaveType: true
        }
    });

    return updatedLeave;
};

const deleteLeaveFromDB = async (companyId: string, leaveId: string) => {
    const isExistCompany = await prisma.company.findUnique({
        where: {
            id: companyId
        }
    });

    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    const isExistLeave = await prisma.leave.findUnique({
        where: {
            id: leaveId,
            companyId: companyId
        }
    });

    if (!isExistLeave) {
        throw new Error("Leave not found");
    }

    const deleteLeave = prisma.leave.delete({
        where: {
            id: leaveId,
            companyId: companyId
        }
    });

    return deleteLeave;
};

export const leaveService = {
    applyForLeaveInDB,
    getAllOrQueryLeavesFromDB,
    employeeLeaveUpdateInDB,
    updateLeaveInDB,
    deleteLeaveFromDB,
}