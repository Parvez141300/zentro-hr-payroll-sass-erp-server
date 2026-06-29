// services/leaveType.service.ts

import { prisma } from "../app/lib/prisma";



export const createDefaultLeaveTypes = async (companyId: string) => {
    const defaultLeaveTypes = [
        {
            name: "Annual Leave",
            description: "Regular annual vacation leave. Must be approved 2 weeks in advance.",
            daysAllowed: 14,
            isPaid: true,
            isActive: true,
            companyId
        },
        {
            name: "Sick Leave",
            description: "Medical leave. Doctor's note required for more than 3 days.",
            daysAllowed: 10,
            isPaid: true,
            isActive: true,
            companyId
        },
        {
            name: "Casual Leave",
            description: "Personal emergency leave. Maximum 2 days at a time.",
            daysAllowed: 6,
            isPaid: true,
            isActive: true,
            companyId
        },
        {
            name: "Maternity Leave",
            description: "Maternity leave as per Bangladesh Labor Law 2023.",
            daysAllowed: 112,
            isPaid: true,
            isActive: true,
            companyId
        },
        {
            name: "Paternity Leave",
            description: "Leave for new fathers.",
            daysAllowed: 5,
            isPaid: true,
            isActive: true,
            companyId
        },
        {
            name: "Bereavement Leave",
            description: "Leave due to death of immediate family member.",
            daysAllowed: 5,
            isPaid: true,
            isActive: true,
            companyId
        },
        {
            name: "Unpaid Leave",
            description: "Leave without pay. Requires special approval.",
            daysAllowed: 30,
            isPaid: false,
            isActive: true,
            companyId
        }
    ];

    const createLeaveTypes = await prisma.leaveType.createMany({
        data: defaultLeaveTypes
    });

    console.log("Seed Default Leave Type for Company", createLeaveTypes);

    return createLeaveTypes;
};

const companyId: string = "cmqwivtky0000mwuz41j97p0u";

createDefaultLeaveTypes(companyId);