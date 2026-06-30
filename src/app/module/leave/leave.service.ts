import { prisma } from "../../lib/prisma";
import { IApplyForLeavePayload } from "./leave.interface"
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

    if(totalDays > isExistLeaveType.daysAllowed) {
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

export const leaveService = {
    applyForLeaveInDB,
}