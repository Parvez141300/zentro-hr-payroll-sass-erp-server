import { DepartmentHead, Employee, HrManager } from "../../../generated/prisma/client";
import { HrScope, LeaveStatus, Role } from "../../../generated/prisma/enums";
import { LeaveUpdateInput, LeaveWhereInput } from "../../../generated/prisma/models";
import { deleteFileFromCloudinary } from "../../config/cloudinary.utils";
import { prisma } from "../../lib/prisma";
import { IApplyForLeavePayload, IEmployeeLeaveUpdatePayload, IGetAllOrQueryLeavesPayload, IUpdateLeavePayload } from "./leave.interface"
import { totalDaysForLeaveCalculation } from "./leave.utils";

const applyForLeaveInDB = async (
    companyId: string,
    userId: string,
    payload: IApplyForLeavePayload
) => {
    const { leaveTypeId, startDate, endDate, reason, photoUrl: attachmentUrl } = payload;

    // ✅ Guard clauses
    if (!leaveTypeId) {
        throw new Error("Leave type ID is required");
    }
    if (!startDate || !endDate) {
        throw new Error("Start date and end date are required");
    }
    if (!reason) {
        throw new Error("Reason is required");
    }

    // ✅ Convert strings to Date objects
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);

    // ✅ Validate dates are valid
    if (isNaN(parsedStartDate.getTime())) {
        throw new Error("Invalid start date");
    }
    if (isNaN(parsedEndDate.getTime())) {
        throw new Error("Invalid end date");
    }

    // Verify company
    const isExistCompany = await prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    // ✅ Use findFirst (not findUnique) for non-unique combinations
    const isExistEmployee = await prisma.employee.findFirst({
        where: { userId, companyId },
    });
    if (!isExistEmployee) {
        throw new Error("Employee not found");
    }

    // ✅ Use findFirst for LeaveType
    const isExistLeaveType = await prisma.leaveType.findFirst({
        where: {
            id: leaveTypeId,
            companyId,
            isActive: true,
        },
    });
    if (!isExistLeaveType) {
        throw new Error("Leave type not found or inactive");
    }

    // ✅ Pass Date objects (not strings) to the utility function
    const totalDays = totalDaysForLeaveCalculation(parsedStartDate, parsedEndDate);

    if (totalDays > isExistLeaveType.daysAllowed) {
        throw new Error(
            `This leave type allows a maximum of ${isExistLeaveType.daysAllowed} days. You requested ${totalDays} days.`
        );
    }

    // ✅ Create leave with Date objects
    const leave = await prisma.leave.create({
        data: {
            companyId,
            employeeId: isExistEmployee.id,
            leaveTypeId,
            startDate: parsedStartDate, // ✅ Date object
            endDate: parsedEndDate,     // ✅ Date object
            totalDays,
            reason,
            attachmentUrl: attachmentUrl || null,
        },
    });

    return leave;
};

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
                        gte: new Date(startDate),
                        lte: new Date(endDate),
                    }
                },
                {
                    endDate: {
                        gte: new Date(startDate),
                        lte: new Date(endDate),
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

const employeeLeaveUpdateInDB = async (
    companyId: string,
    leaveId: string,
    payload: IEmployeeLeaveUpdatePayload
) => {
    const {
        leaveTypeId,
        startDate,
        endDate,
        reason,
        photoUrl: attachmentUrl,
        status,
    } = payload;

    // ✅ 1. Guard clauses
    if (status && status !== LeaveStatus.CANCELLED) {
        throw new Error("Only cancelled leave can be updated by employee");
    }

    // ✅ 2. Verify company
    const isExistCompany = await prisma.company.findUnique({
        where: { id: companyId },
    });
    if (!isExistCompany) {
        throw new Error("Company not found");
    }

    // ✅ 3. Verify leave exists and belongs to this company
    const isExistLeave = await prisma.leave.findUnique({
        where: { id: leaveId },
        include: {
            employee: { select: { id: true, companyId: true } },
        },
    });

    if (!isExistLeave || isExistLeave.employee.companyId !== companyId) {
        throw new Error("Leave not found");
    }

    // ✅ 4. Verify leave is still PENDING (only pending leaves can be edited)
    if (isExistLeave.status !== LeaveStatus.PENDING) {
        throw new Error(
            `Only pending leaves can be updated. Current status: ${isExistLeave.status}`
        );
    }

    // ✅ 5. Build the update payload (partial update)
    const updateData: Record<string, unknown> = {};

    // Leave Type (optional — only if changed)
    if (leaveTypeId && leaveTypeId !== isExistLeave.leaveTypeId) {
        const isExistLeaveType = await prisma.leaveType.findFirst({
            where: {
                id: leaveTypeId,
                companyId,
                isActive: true,
            },
        });
        if (!isExistLeaveType) {
            throw new Error("Leave type not found or inactive");
        }
        updateData.leaveTypeId = leaveTypeId;
    }

    // Dates (optional — need to validate both)
    const parsedStartDate = startDate
        ? new Date(startDate)
        : new Date(isExistLeave.startDate);
    const parsedEndDate = endDate
        ? new Date(endDate)
        : new Date(isExistLeave.endDate);

    if (startDate) {
        if (isNaN(parsedStartDate.getTime())) {
            throw new Error("Invalid start date");
        }
        updateData.startDate = parsedStartDate;
    }
    if (endDate) {
        if (isNaN(parsedEndDate.getTime())) {
            throw new Error("Invalid end date");
        }
        updateData.endDate = parsedEndDate;
    }

    // ✅ 6. Recalculate totalDays if any date changed
    if (startDate || endDate) {
        if (parsedEndDate < parsedStartDate) {
            throw new Error("End date cannot be before start date");
        }

        const totalDays = totalDaysForLeaveCalculation(
            parsedStartDate,
            parsedEndDate
        );

        // Re-check against daysAllowed
        const leaveTypeIdToCheck = (updateData.leaveTypeId as string) || isExistLeave.leaveTypeId;
        const leaveType = await prisma.leaveType.findUnique({
            where: { id: leaveTypeIdToCheck },
            select: { daysAllowed: true, name: true },
        });

        if (!leaveType) {
            throw new Error("Leave type not found");
        }

        if (totalDays > leaveType.daysAllowed) {
            throw new Error(
                `This leave type allows a maximum of ${leaveType.daysAllowed} days. You requested ${totalDays} days.`
            );
        }

        updateData.totalDays = totalDays;
    }

    // Reason (optional)
    if (reason && reason.trim() !== "") {
        updateData.reason = reason;
    }

    // Attachment (optional — only if a new file was uploaded)
    if (attachmentUrl) {
        updateData.attachmentUrl = attachmentUrl;
    }

    // Status (optional — only allowed CANCELLED)
    if (status) {
        updateData.status = status;
    }

    // ✅ 7. Prevent empty updates
    if (Object.keys(updateData).length === 0) {
        throw new Error("No changes were provided");
    }

    // ✅ 8. Update the leave
    const updateLeave = await prisma.leave.update({
        where: { id: leaveId },
        data: updateData,
    });

    // ✅ 9. Delete old attachment from Cloudinary ONLY if a new one was uploaded
    if (attachmentUrl && isExistLeave.attachmentUrl) {
        try {
            await deleteFileFromCloudinary(isExistLeave.attachmentUrl);
        } catch (error) {
            console.error("Failed to delete old attachment:", error);
            // Don't throw — the update was successful, cleanup is best-effort
        }
    }

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