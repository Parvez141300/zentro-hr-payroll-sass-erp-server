import { prisma } from "../app/lib/prisma";
import { ISubscriptionPlanConfigPayload } from "../app/module/subscriptionPlanConfig/subscriptionPlanConfig.interface";
import { Prisma } from "../generated/prisma/client";


export const defaultSubscriptionPlansConfig: ISubscriptionPlanConfigPayload[] = [
  {
    name: "FREE",
    displayName: "Free Plan",
    description: "Perfect for small teams starting out now",
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
        id: "feat_1793797950802_c3pr1o",
        name: "Manage Department",
        description: "Manage Department like add, edit, delete",
        included: true,
        icon: "Settings",
        category: "General"
      },
      {
        id: "feat_1793797950937_o8kapa",
        name: "Manage Designation",
        description: "Manage Designation like add, edit, delete",
        included: true,
        icon: "Settings",
        category: "General"
      },
      {
        id: "feat_1793806325989_fiezw3",
        name: "Manage HR ",
        description: "Manage HR like only can create HR",
        included: true,
        icon: "Users",
        category: "General"
      },
      {
        id: "feat_1793806326117_khltk2",
        name: "Manage Department Head",
        description: "Manage Department Head like only can create Department Head",
        included: true,
        icon: "Users",
        category: "General"
      },
      {
        id: "feat_1793806806857_sb0459",
        name: "Manage Company",
        description: "Manage company details like logo, banner and other details",
        included: true,
        icon: "Settings",
        category: "General"
      }
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
      {
        id: "feat_1793797409565_hveqkd",
        name: "Manage Department Head",
        description: "Manage Department Heads like Add, Edit, Delete",
        included: true,
        icon: "Shield",
        category: "General"
      },
      {
        id: "feat_1793797541698_z5o4ed",
        name: "Mange HR",
        description: "Manage HR like add, edit, delete",
        included: true,
        icon: "Crown",
        category: "General"
      },
      {
        id: "feat_1793797892678_wsjx4c",
        name: "Manage Department ",
        description: "Manage Department like add, edit, delete",
        included: true,
        icon: "Settings",
        category: "General"
      },
      {
        id: "feat_1793797894485_vueanx",
        name: "Manage Designation",
        description: "Manage Designation like add, edit, delete",
        included: true,
        icon: "Settings",
        category: "General"
      },
      {
        id: "feat_1793806946742_xd4029",
        name: "Manage Company",
        description: "Manage company details like logo, banner and other details",
        included: true,
        icon: "Settings",
        category: "General"
      }
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
        id: "feat_1793797641552_7pe1nx",
        name: "Manage Department Heads",
        description: "Manage Department Head like add, edit, delete",
        included: true,
        icon: "Shield",
        category: "General"
      },
      {
        id: "feat_1793797641973_ideoz7",
        name: "Manage HR",
        description: "Manage HR like add, edit, delete",
        included: true,
        icon: "Crown",
        category: "General"
      },
      {
        id: "feat_1793797838331_acjhns",
        name: "Manage Department",
        description: "Manage Department like add, edit, delete",
        included: true,
        icon: "Settings",
        category: "General"
      },
      {
        id: "feat_1793797850264_q7f999",
        name: "Manage Designation",
        description: "Manage Designation like add, edit, delete",
        included: true,
        icon: "Settings",
        category: "General"
      },
      {
        id: "feat_1793806917521_8j758r",
        name: "Manage Company",
        description: "Manage company details like logo, banner and other details",
        included: true,
        icon: "Settings",
        category: "General"
      }
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
        id: "feat_1793797705341_9vfjdu",
        name: "Manage Department Heads",
        description: "Manage Department Head like add, edit, delete",
        included: true,
        icon: "Shield",
        category: "General"
      },
      {
        id: "feat_1793797733376_f3lpdy",
        name: "Manage HR",
        description: "Manage HR like add, edit, delete",
        included: true,
        icon: "Crown",
        category: "General"
      },
      {
        id: "feat_1793797782411_cmkcnj",
        name: "Manage Department",
        description: "Manage Department like add, edit, delete",
        included: true,
        icon: "Settings",
        category: "General"
      },
      {
        id: "feat_1793797782546_me2kuf",
        name: "Manage Designation",
        description: "Manage Designation like add, edit, delete",
        included: true,
        icon: "Settings",
        category: "General"
      },
      {
        id: "feat_1793806887814_tnc4up",
        name: "Manage Company",
        description: "Manage company details like logo, banner and other details",
        included: true,
        icon: "Settings",
        category: "General"
      }
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

seedDefaultSubscriptionPlanConfigInDB(defaultSubscriptionPlansConfig);