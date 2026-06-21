import { prisma } from "../app/lib/prisma";
import { ISubscriptionPlanConfigPayload } from "../app/module/subscriptionPlanConfig/subscriptionPlanConfig.interface";
import { Prisma } from "../generated/prisma/client";


export const defaultSubscriptionPlanConfigs: ISubscriptionPlanConfigPayload[] = [
  {
    name: "FREE",
    displayName: "Free Plan",
    description: "Perfect for small teams starting out",
    priceUSD: 0,
    priceBDT: 0,
    yearlyPriceUSD: 0,
    yearlyPriceBDT: 0,
    maxEmployees: 10,
    sortOrder: 1,
    popularBadge: false,
    isActive: true,
    features: [
      {
        id: "feat_001",
        name: "Employee Management",
        description: "Add, edit, and manage employee profiles",
        included: true,
        icon: "Users",
        category: "core"
      },
      {
        id: "feat_002",
        name: "Attendance Tracking",
        description: "Mark daily attendance and view history",
        included: true,
        icon: "Clock",
        category: "attendance"
      },
      {
        id: "feat_003",
        name: "Leave Management",
        description: "Apply for leave and view balance",
        included: true,
        icon: "Calendar",
        category: "leave"
      },
      {
        id: "feat_004",
        name: "Payroll Processing",
        description: "Generate and process payroll",
        included: false,
        icon: "DollarSign",
        category: "payroll"
      },
      {
        id: "feat_005",
        name: "Reports & Analytics",
        description: "Advanced HR and financial reports",
        included: false,
        icon: "BarChart",
        category: "reports"
      },
    ]
  },
  {
    name: "BASIC",
    displayName: "Basic Plan",
    description: "Essential features for growing businesses",
    priceUSD: 19,
    priceBDT: 2100,
    yearlyPriceUSD: 190,
    yearlyPriceBDT: 21000,
    maxEmployees: 50,
    sortOrder: 2,
    popularBadge: false,
    isActive: true,
    features: [
      {
        id: "feat_001",
        name: "Employee Management",
        description: "Add, edit, and manage employee profiles",
        included: true,
        icon: "Users",
        category: "core"
      },
      {
        id: "feat_002",
        name: "Attendance Tracking",
        description: "Mark daily attendance and view history",
        included: true,
        icon: "Clock",
        category: "attendance"
      },
      {
        id: "feat_003",
        name: "Leave Management",
        description: "Apply for leave and view balance",
        included: true,
        icon: "Calendar",
        category: "leave"
      },
      {
        id: "feat_004",
        name: "Payroll Processing",
        description: "Generate and process payroll",
        included: true,
        icon: "DollarSign",
        category: "payroll"
      },
      {
        id: "feat_005",
        name: "Reports & Analytics",
        description: "Basic HR reports",
        included: true,
        icon: "BarChart",
        category: "reports"
      },
    ]
  },
  {
    name: "PRO",
    displayName: "Pro Plan",
    description: "Advanced features for scaling teams",
    priceUSD: 49,
    priceBDT: 5400,
    yearlyPriceUSD: 490,
    yearlyPriceBDT: 54000,
    maxEmployees: 200,
    sortOrder: 3,
    popularBadge: true,
    isActive: true,
    features: [
      {
        id: "feat_001",
        name: "Employee Management",
        description: "Add, edit, and manage employee profiles",
        included: true,
        icon: "Users",
        category: "core"
      },
      {
        id: "feat_002",
        name: "Attendance Tracking",
        description: "Mark daily attendance with advanced options",
        included: true,
        icon: "Clock",
        category: "attendance"
      },
      {
        id: "feat_003",
        name: "Leave Management",
        description: "Full leave management with approvals",
        included: true,
        icon: "Calendar",
        category: "leave"
      },
      {
        id: "feat_004",
        name: "Payroll Processing",
        description: "Generate payroll with tax calculations",
        included: true,
        icon: "DollarSign",
        category: "payroll"
      },
      {
        id: "feat_005",
        name: "PDF Payslip Generation",
        description: "Generate and download PDF payslips",
        included: true,
        icon: "FileText",
        category: "payroll"
      },
      {
        id: "feat_006",
        name: "Advanced Reports",
        description: "HR analytics and financial reports",
        included: true,
        icon: "BarChart",
        category: "reports"
      },
      {
        id: "feat_007",
        name: "Audit Logs",
        description: "Track all actions in the system",
        included: true,
        icon: "Shield",
        category: "core"
      },
    ]
  },
  {
    name: "ENTERPRISE",
    displayName: "Enterprise Plan",
    description: "Custom solutions for large organizations",
    priceUSD: 99,
    priceBDT: 10900,
    yearlyPriceUSD: 990,
    yearlyPriceBDT: 109000,
    maxEmployees: 999999,
    sortOrder: 4,
    popularBadge: false,
    isActive: true,
    features: [
      {
        id: "feat_001",
        name: "Employee Management",
        description: "Add, edit, and manage employee profiles",
        included: true,
        icon: "Users",
        category: "core"
      },
      {
        id: "feat_002",
        name: "Attendance Tracking",
        description: "Mark daily attendance with advanced options",
        included: true,
        icon: "Clock",
        category: "attendance"
      },
      {
        id: "feat_003",
        name: "Leave Management",
        description: "Full leave management with approvals",
        included: true,
        icon: "Calendar",
        category: "leave"
      },
      {
        id: "feat_004",
        name: "Payroll Processing",
        description: "Generate payroll with tax calculations",
        included: true,
        icon: "DollarSign",
        category: "payroll"
      },
      {
        id: "feat_005",
        name: "PDF Payslip Generation",
        description: "Generate and download PDF payslips",
        included: true,
        icon: "FileText",
        category: "payroll"
      },
      {
        id: "feat_006",
        name: "Advanced Reports",
        description: "Custom HR and financial reports",
        included: true,
        icon: "BarChart",
        category: "reports"
      },
      {
        id: "feat_007",
        name: "Audit Logs",
        description: "Track all actions in the system",
        included: true,
        icon: "Shield",
        category: "core"
      },
    ]
  }
];

const seedDefaultSubscriptionPlanConfigInDB = async (payload: ISubscriptionPlanConfigPayload[]) => {

    const data = payload.map(item => ({
        ...item,
        features: item.features as unknown as Prisma.InputJsonValue
    }));

    const subscriptionPlanConfig = await prisma.subscriptionPlanConfig.createMany({
        data: [
            ...data
        ]
    });

    console.log('seedin subscription plan config', subscriptionPlanConfig);
    return subscriptionPlanConfig;
};

seedDefaultSubscriptionPlanConfigInDB(defaultSubscriptionPlanConfigs);