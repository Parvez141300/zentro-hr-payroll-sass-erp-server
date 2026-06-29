import { LeaveTypeWhereInput } from "../../../generated/prisma/models";
import { prisma } from "../../lib/prisma";
import { ICreateLeaveTypePayload, IGetLeaveTypePayload, IUpdateLeaveTypePayload } from "./leaveType.interface";

const createLeaveTypeInDB = async (
    companyId: string,
    payload: ICreateLeaveTypePayload
) => {
    const { name, description, daysAllowed, isPaid, isActive } = payload;

    const company = await prisma.company.findUnique({
        where: {
            id: companyId
        },
    });

    if (!company) {
        throw new Error("Company not found to create leave type");
    }

    // Check if leave type already exists
    const existing = await prisma.leaveType.findFirst({
        where: {
            name,
            companyId
        }
    });

    if (existing) {
        throw new Error(`Leave type "${name}" already exists`);
    }

    const leaveType = await prisma.leaveType.create({
        data: {
            name,
            description,
            daysAllowed,
            isPaid: isPaid ?? true,
            isActive: isActive ?? true,
            companyId
        }
    });

    return leaveType;
};

const getAllOrQueryLeaveTypesFromDB = async (companyId: string, payload: IGetLeaveTypePayload) => {
    const { search, page, limit, skip, sortBy, sortOrder, isActive, isPaid } = payload;

    const isExistCompany = await prisma.company.findFirstOrThrow({
        where: {
            id: companyId
        }
    });

    const addCondition: LeaveTypeWhereInput[] = [];

    if (search) {
        addCondition.push({
            OR: [
                {
                    name: {
                        contains: search,
                        mode: "insensitive"
                    }
                },
            ]
        });
    }

    if (isActive) {
        addCondition.push({
            isActive: isActive
        });
    }

    if (isPaid) {
        addCondition.push({
            isPaid: isPaid
        });
    }

    const leaveTypes = await prisma.leaveType.findMany({
        where: {
            companyId: isExistCompany.id,
            AND: addCondition
        },
        skip,
        take: limit,
        orderBy: {
            [sortBy]: sortOrder
        }
    });

    const leaveTypeCount = await prisma.leaveType.count({
        where: {
            companyId: isExistCompany.id,
            AND: addCondition
        }
    });

    return {
        data: leaveTypes,
        pagination: {
            total: leaveTypeCount,
            page: page,
            limit: limit,
            totalPages: Math.ceil(leaveTypeCount / limit),
        }
    }
};

const updateLeaveTypeInDB = async (companyId: string, leaveTypeId: string, payload: IUpdateLeaveTypePayload) => {
    const isExistCompany = await prisma.company.findFirstOrThrow({
        where: {
            id: companyId
        }
    });
    
    const isExistLeaveType = await prisma.leaveType.findFirstOrThrow({
        where: {
            id: leaveTypeId,
            companyId: isExistCompany.id
        }
    });

    const updateLeaveType = await prisma.leaveType.update({
        where: {
            id: isExistLeaveType.id,
            companyId: isExistCompany.id
        },
        data: {
            ...payload
        }
    });
    
    return updateLeaveType;
};

const deleteLeaveTypeFromDB = async (companyId: string, leaveTypeId: string) => {
    const isExistCompany = await prisma.company.findFirstOrThrow({
        where: {
            id: companyId
        }
    });
    
    const isExistLeaveType = await prisma.leaveType.findFirstOrThrow({
        where: {
            id: leaveTypeId,
            companyId: isExistCompany.id
        }
    });

    const deleteLeaveType = await prisma.leaveType.delete({
        where: {
            id: isExistLeaveType.id,
            companyId: isExistCompany.id
        }
    });
    
    return deleteLeaveType;
};

export const leaveTypeService = {
    createLeaveTypeInDB,
    getAllOrQueryLeaveTypesFromDB,
    updateLeaveTypeInDB,
    deleteLeaveTypeFromDB,
};