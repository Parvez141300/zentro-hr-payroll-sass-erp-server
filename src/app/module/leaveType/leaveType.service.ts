import { prisma } from "../../lib/prisma";
import { ICreateLeaveTypePayload } from "./leaveType.interface";

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

export const leaveTypeService = {
    createLeaveTypeInDB,
};