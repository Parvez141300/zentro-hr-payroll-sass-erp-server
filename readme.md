# 🏢 Zentro — HR & Payroll ERP Full Project Documentation

> **Stack:** Next.js · React · Express.js · Prisma ORM · PostgreSQL · Better Auth · TanStack Query · TanStack Form · Shadcn UI · Tailwind CSS · Stripe · SSLCommerz

---

## 📌 Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Role-Based Access Control (RBAC)](#5-role-based-access-control-rbac)
4. [Role Profile Models](#4-role-profile-models)
5. [Features by Module](#5-features-by-module)
6. [Database Schema](#6-database-schema)
7. [Payment Integration](#7-payment-integration)
8. [API Routes](#8-api-routes)
9. [Folder Structure](#9-folder-structure)
10. [Development Roadmap](#10-development-roadmap)
11. [Environment Variables](#11-environment-variables)
12. [Deployment Guide](#12-deployment-guide)

---

## 1. Project Overview

**Project Name:** Zentro

**Description:**
Zentro is a modern HR and Payroll ERP platform designed to centralize employee management, attendance tracking, leave administration, payroll processing, and workforce analytics in a single secure system. Built for growing organizations, Zentro streamlines HR operations through role-based access control, automated workflows, reporting, and enterprise-grade security.

**Type:** Internal Enterprise Web Application

**Purpose:** A full-featured HR and Payroll management system that allows companies to manage employees, departments, attendance, leave, payroll, and financial reports — all in one place.

### What This Project Demonstrates

- Role-based access control with 5 distinct user roles
- Individual profile models per role with role-specific data
- Complex relational database design with Prisma + PostgreSQL
- Full-stack API design with Express.js
- Modern React UI with Shadcn + Tailwind
- Server state management with TanStack Query
- Form validation with TanStack Form
- Secure authentication with Better Auth
- Payment processing with Stripe (international) + SSLCommerz (Bangladesh)

---

## 2. Tech Stack

| Layer                   | Technology               | Purpose                   |
| ----------------------- | ------------------------ | ------------------------- |
| Frontend Framework      | Next.js (App Router)     | Pages, routing, SSR       |
| UI Components           | Shadcn UI + Tailwind CSS | Design system             |
| State Management        | TanStack Query v5        | Server state, caching     |
| Form Handling           | TanStack Form            | Validation, submission    |
| Authentication          | Better Auth              | Session, roles, JWT       |
| Backend                 | Express.js               | REST API server           |
| ORM                     | Prisma ORM               | Database queries          |
| Database                | PostgreSQL               | Data storage              |
| File Storage            | Cloudinary (free tier)   | Profile photos, documents |
| PDF Generation          | React PDF                | Payslip download          |
| Payment (International) | Stripe                   | Subscription billing      |
| Payment (Bangladesh)    | SSLCommerz               | Local payment gateway     |
| Deployment (Frontend)   | Vercel                   | Free hosting              |
| Deployment (Backend)    | Railway                  | Free hosting              |
| Deployment (DB)         | Supabase / Neon          | Free PostgreSQL           |

---

## 3. Role-Based Access Control (RBAC)

### The 6 Roles (Now including Platform Admin)

| Role                      | বাংলা                    | Description                                        |
| ------------------------- | ------------------------ | -------------------------------------------------- |
| `PLATFORM_SUPER_ADMIN`    | প্ল্যাটফর্ম সুপার অ্যাডমিন | Owns the SaaS platform, manages all companies, plans, and system settings |
| `SUPER_ADMIN`             | সুপার অ্যাডমিন           | Full company access, manages everything within their company |
| `HR_MANAGER`              | এইচআর ম্যানেজার          | Manages employees, leave, attendance within their company |
| `ACCOUNTANT`              | অ্যাকাউন্ট্যান্ট         | Manages payroll, salary, financial reports |
| `DEPARTMENT_HEAD`         | বিভাগীয় প্রধান          | Manages own department team & leave approvals |
| `EMPLOYEE`                | কর্মচারী                 | Views own profile, applies for leave, sees payslip |

---

### Permission Matrix

#### PLATFORM_SUPER_ADMIN — Can do everything across ALL companies:
- Manage ALL Companies ✅
- View ALL Subscriptions ✅
- Create/Edit/Delete Subscription Plans ✅
- Set Global System Settings
- View ALL Audit Logs
- Configure Payment Gateways (Stripe, SSLCommerz)
- View Platform Analytics & Revenue

#### SUPER_ADMIN — Can do everything:

- Manage Departments ✅
- Manage Designations ✅
- Manage HR Managers ✅
- Manage Accountants ✅
- Manage Department Heads ✅
- Manage Employees ✅
- Manage Attendance
- Manage Leave Requests
- Generate & Approve Payroll
- View All Reports
- Manage Users & Roles
- Configure System Settings
- Manage Company Subscription & Billing

#### HR_MANAGER — Can:

- Add/Edit Employees ✅
- Create/Edit Departments ✅
- Manage Attendance 
- Approve Leave Requests
- View HR Reports

Cannot: Delete Departments, Delete Employees, Manage Payroll, Manage System Settings

#### ACCOUNTANT — Can:

- View Employees ✅
- Generate Payroll
- Edit Payroll
- Mark Payroll as Paid
- View Financial Reports
- View Payment History

Cannot: Manage Employees, Manage Attendance, Approve Leave, Manage Settings

#### DEPARTMENT_HEAD — Can:

- View Employees in Own Department ✅
- View Department Attendance
- Approve Leave for Own Department
- View Department Reports

Cannot: Add Employees, Manage Payroll, Manage Settings

#### EMPLOYEE — Can:

- View Own Profile ✅
- View Own Attendance
- Apply for Leave
- Download Own Payslip

Cannot: View Other Employees, Approve Leave, Manage Payroll, Manage Settings

---

## 4. Role Profile Models

প্রতিটি role-এর জন্য আলাদা profile আছে। Base `User` model সবার জন্য common, তারপর role অনুযায়ী আলাদা profile table-এ বাড়তি তথ্য থাকে।

---

### 👑 Platform Super Admin Profile

Platform Super Admin হলো Zentro SaaS platform-এর মালিক। তিনি সব companies manage করতে পারেন।

**Profile Fields:**
| Field | Type | Description |
|-------|------|-------------|
| fullName | String | পুরো নাম |
| email | String | ইমেইল ঠিকানা |
| createdAt | DateTime | অ্যাকাউন্ট তৈরি করার তারিখ |

**Pages:**

- `/platform/dashboard` — Platform admin dashboard
- `/platform/companies` — Manage all companies
- `/platform/subscription-plans` — Manage pricing plans
- `/platform/analytics` — View platform revenue & analytics
- `/platform/settings` — Platform settings

### 👑 Super Admin Profile

Super Admin হলো system-এর মালিক বা CTO/CEO পর্যায়ের কেউ। তার profile-এ company-level তথ্য ও system access থাকে।

**Profile Fields:**
| Field | Type | Description |
|---|---|---|
| fullName | String | পুরো নাম |
| phone | String | যোগাযোগ নম্বর |
| photoUrl | String | প্রোফাইল ছবি |
| companyName | String | কোম্পানির নাম |
| companyLogo | String | কোম্পানির লোগো URL |
| companyAddress | String | কোম্পানির ঠিকানা |
| companyEmail | String | অফিসিয়াল ইমেইল |
| subscriptionPlan | Enum | FREE / BASIC / PRO / ENTERPRISE |
| subscriptionStatus | Enum | ACTIVE / EXPIRED / CANCELLED |
| billingEmail | String | বিলিং ইমেইল |
| stripeCustomerId | String | Stripe customer ID |
| lastLoginAt | DateTime | সর্বশেষ লগইন |
| twoFactorEnabled | Boolean | 2FA চালু আছে কিনা |

**Pages:**

- `/dashboard/settings/profile` — Super Admin profile & company info
- `/dashboard/settings/billing` — Subscription & payment history

---

### 👩‍💼 HR Manager Profile

HR Manager কর্মী ব্যবস্থাপনার দায়িত্বে থাকেন। তার profile-এ HR-specific তথ্য থাকে।

**Profile Fields:**
| Field | Type | Description |
|---|---|---|
| fullName | String | পুরো নাম |
| phone | String | যোগাযোগ নম্বর |
| photoUrl | String | প্রোফাইল ছবি |
| employeeCode | String | কর্মচারী কোড |
| department | String | কোন বিভাগে কাজ করেন |
| designation | String | পদবি |
| joinDate | DateTime | যোগদানের তারিখ |
| hrLicenseNumber | String? | HR সার্টিফিকেশন নম্বর (optional) |
| managedDepartments | String[] | যেসব বিভাগ পরিচালনা করেন |
| officePhone | String? | অফিস ফোন |
| bio | String? | সংক্ষিপ্ত পরিচিতি |
| lastLoginAt | DateTime | সর্বশেষ লগইন |

**Pages:**

- `/dashboard/profile` — HR Manager নিজের profile দেখা ও সম্পাদনা

---

### 💳 Accountant Profile

Accountant আর্থিক বিষয় দেখাশোনা করেন। তার profile-এ financial credential তথ্য থাকে।

**Profile Fields:**
| Field | Type | Description |
|---|---|---|
| fullName | String | পুরো নাম |
| phone | String | যোগাযোগ নম্বর |
| photoUrl | String | প্রোফাইল ছবি |
| employeeCode | String | কর্মচারী কোড |
| designation | String | পদবি (e.g. Senior Accountant) |
| joinDate | DateTime | যোগদানের তারিখ |
| caLicenseNumber | String? | CA/CPA লাইসেন্স নম্বর |
| taxIdNumber | String? | ট্যাক্স আইডি |
| bankName | String? | ব্যাংকের নাম |
| bankAccount | String? | ব্যাংক অ্যাকাউন্ট নম্বর |
| fiscalYearAccess | Boolean | বর্তমান অর্থবছরে অ্যাক্সেস |
| lastLoginAt | DateTime | সর্বশেষ লগইন |

**Pages:**

- `/dashboard/profile` — Accountant নিজের profile দেখা ও সম্পাদনা

---

### 🏢 Department Head Profile

Department Head একটি নির্দিষ্ট বিভাগের নেতৃত্ব দেন। তার profile-এ team management তথ্য থাকে।

**Profile Fields:**
| Field | Type | Description |
|---|---|---|
| fullName | String | পুরো নাম |
| phone | String | যোগাযোগ নম্বর |
| photoUrl | String | প্রোফাইল ছবি |
| employeeCode | String | কর্মচারী কোড |
| departmentId | String | কোন বিভাগের প্রধান |
| designation | String | পদবি (e.g. Engineering Lead) |
| joinDate | DateTime | যোগদানের তারিখ |
| teamSize | Int | দলের সদস্য সংখ্যা (auto-calculated) |
| officeLocation | String? | অফিসের রুম/ফ্লোর |
| linkedinUrl | String? | LinkedIn প্রোফাইল |
| bio | String? | সংক্ষিপ্ত পরিচিতি |
| lastLoginAt | DateTime | সর্বশেষ লগইন |

**Pages:**

- `/dashboard/profile` — Department Head নিজের profile দেখা ও সম্পাদনা
- `/dashboard/my-department` — নিজের বিভাগের overview

---

### 👤 Employee Profile

Employee হলো সাধারণ কর্মচারী। তার profile-এ personal ও job তথ্য থাকে।

**Profile Fields:**
| Field | Type | Description |
|---|---|---|
| firstName | String | প্রথম নাম |
| lastName | String | শেষ নাম |
| phone | String | ফোন নম্বর |
| photoUrl | String | প্রোফাইল ছবি |
| dateOfBirth | DateTime | জন্মতারিখ |
| gender | Enum | MALE / FEMALE / OTHER |
| address | String | বর্তমান ঠিকানা |
| employeeCode | String | কর্মচারী কোড (e.g. EMP-001) |
| departmentId | String | বিভাগ |
| designationId | String | পদবি |
| joinDate | DateTime | যোগদানের তারিখ |
| employmentType | Enum | FULL_TIME / PART_TIME / CONTRACT |
| basicSalary | Float | মূল বেতন |
| bankName | String? | ব্যাংকের নাম |
| bankAccount | String? | অ্যাকাউন্ট নম্বর |
| emergencyName | String? | জরুরি যোগাযোগের নাম |
| emergencyPhone | String? | জরুরি যোগাযোগের ফোন |
| emergencyRelation | String? | সম্পর্ক |
| nidNumber | String? | জাতীয় পরিচয়পত্র নম্বর |
| bloodGroup | String? | রক্তের গ্রুপ |
| lastLoginAt | DateTime | সর্বশেষ লগইন |

**Pages:**

- `/dashboard/profile` — Employee নিজের profile দেখা ও সম্পাদনা
- `/dashboard/my-payslips` — নিজের সব payslip
- `/dashboard/my-attendance` — নিজের হাজিরা
- `/dashboard/my-leaves` — নিজের ছুটির ইতিহাস

---

## 5. Features by Module

### 🔐 Module 1: Authentication

- Login with email & password (Better Auth)
- JWT session management
- Role-based redirect after login
- Password reset via email
- Protected routes by role

**Pages:**

- `/login` — Login form
- `/forgot-password` — Password reset request
- `/reset-password` — New password form

---

### 👤 Module 2: Employee Management

- Add new employee with full profile
- Upload profile photo (Cloudinary)
- Edit employee details
- Soft delete (deactivate) employee
- Filter & search employees by name, department, status
- View employee detail page

**Pages:**

- `/dashboard/employees` — Employee list with search/filter
- `/dashboard/employees/new` — Add employee form
- `/dashboard/employees/[id]` — Employee detail
- `/dashboard/employees/[id]/edit` — Edit employee

---

### 🏢 Module 3: Department & Designation Management

- Create, edit, delete departments
- Assign department head
- Create designations under each department
- View employees per department

**Pages:**

- `/dashboard/departments` — Department list
- `/dashboard/departments/new` — Add department
- `/dashboard/designations` — Designation list

---

### 📅 Module 4: Attendance Management

- Mark daily attendance (Present / Absent / Late / Half-Day)
- View attendance calendar per employee
- Monthly attendance summary
- Department-wise attendance report
- Edit attendance (HR Manager / Super Admin only)

**Pages:**

- `/dashboard/attendance` — Attendance overview
- `/dashboard/attendance/mark` — Mark attendance (bulk)
- `/dashboard/attendance/[employeeId]` — Individual attendance calendar
- `/dashboard/attendance/reports` — Monthly reports

---

### 🏖️ Module 5: Leave Management

- Leave types: Annual, Sick, Casual, Maternity, Unpaid
- Apply for leave with date range & reason
- Leave approval workflow:
  - Employee applies → Department Head reviews → HR Manager approves
- Leave balance tracking per employee
- Leave history

**Pages:**

- `/dashboard/leave` — All leave requests (filtered by role)
- `/dashboard/leave/apply` — Apply for leave form
- `/dashboard/leave/[id]` — Leave detail & approval action
- `/dashboard/leave/balance` — My leave balance

---

### 💰 Module 6: Payroll Management

- Monthly payroll generation per employee
- Salary breakdown:
  - Basic salary
  - House rent allowance (HRA)
  - Medical allowance
  - Transport allowance
  - Overtime pay
  - Tax deduction
  - Provident fund deduction
  - Other deductions
  - **Net salary = Gross - Total Deductions**
- Payroll approval by Super Admin
- Mark as paid
- Generate & download payslip as PDF

**Pages:**

- `/dashboard/payroll` — Monthly payroll list
- `/dashboard/payroll/generate` — Generate payroll for a month
- `/dashboard/payroll/[id]` — Payroll detail
- `/dashboard/payroll/[id]/payslip` — PDF payslip preview & download

---

### 📊 Module 7: Reports & Dashboard

- Super Admin Dashboard: total employees, payroll cost, attendance rate, pending leaves
- HR Reports: headcount by department (bar chart), attendance rate (line chart), leave usage (pie chart)
- Financial Reports: monthly payroll summary, department salary expense, year-to-date cost

**Pages:**

- `/dashboard` — Role-specific dashboard home
- `/dashboard/reports/hr` — HR reports
- `/dashboard/reports/financial` — Financial reports

---

### 💳 Module 8: Payment & Subscription

_(Details in Section 7)_

**Pages:**

- `/dashboard/settings/billing` — Subscription plans & current plan
- `/dashboard/settings/billing/checkout` — Payment checkout
- `/dashboard/settings/billing/history` — Payment history

---

### ⚙️ Module 9: Settings (Super Admin only)

- Company profile (name, logo, address)
- Fiscal year settings
- Leave type configuration
- Role & user management
- System audit log

**Pages:**

- `/dashboard/settings/company` — Company info
- `/dashboard/settings/leave-types` — Configure leave types
- `/dashboard/settings/users` — Manage user accounts
- `/dashboard/settings/audit-log` — Activity log

---

## 6. 🏢 Platform Module - এক লাইনে

**Access:** শুধু `PLATFORM_SUPER_ADMIN`

**Pages:**
- `/platform/dashboard` — Main dashboard
- `/platform/companies` — সব কোম্পানি দেখুন
- `/platform/subscription-plans` — প্ল্যান ম্যানেজ করুন
- `/platform/analytics` — রেভিনিউ দেখুন
- `/platform/payments` — সব পেমেন্ট দেখুন
- `/platform/audit-logs` — সব অ্যাক্টিভিটি দেখুন
- `/platform/settings` — সেটিংস

**Seed Data:**
```bash
POST /api/platform/setup
{
  "email": "admin@zentro.com",
  "password": "password",
  "fullName": "Zentro Owner"
}
```

**API Routes:**
| Method | Route |
|--------|-------|
| GET | `/platform/companies` |
| GET | `/platform/subscription-plans` |
| GET | `/platform/analytics/revenue` |
| GET | `/platform/payments` |

**Done!** 🚀

## 7. Database Schema

// ============================================
// CORRECTED FULL SCHEMA
// ============================================

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─── ENUMS ────────────────────────────────────────────

// Role Enum
enum Role {
  PLATFORM_SUPER_ADMIN  // 👈 Added: Owns the SaaS platform
  SUPER_ADMIN
  HR_MANAGER
  ACCOUNTANT
  DEPARTMENT_HEAD
  EMPLOYEE
}

// Gender Enum
enum Gender {
  MALE
  FEMALE
  OTHER
}

// Employment Type Enum
enum EmploymentType {
  FULL_TIME
  PART_TIME
  CONTRACT
  INTERN
}

// Employee Status Enum
enum EmployeeStatus {
  ACTIVE
  INACTIVE
  TERMINATED
  ON_LEAVE
}

// Attendance Status Enum
enum AttendanceStatus {
  PRESENT
  ABSENT
  LATE
  HALF_DAY
  HOLIDAY
  WEEKEND
}

// Leave Status Enum
enum LeaveStatus {
  PENDING
  APPROVED_BY_HEAD
  APPROVED
  REJECTED
  CANCELLED
}

// Payroll Status Enum
enum PayrollStatus {
  DRAFT
  APPROVED
  PAID
  CANCELLED
}

// Subscription Plan Enum
enum SubscriptionPlan {
  FREE
  BASIC
  PRO
  ENTERPRISE
}

// Subscription Status Enum
enum SubscriptionStatus {
  ACTIVE
  EXPIRED
  CANCELLED
  TRIAL
  PAST_DUE
}

// Payment Status Enum
enum PaymentStatus {
  PENDING
  SUCCESS
  FAILED
  REFUNDED
  CANCELLED
}

// Payment Gateway Enum
enum PaymentGateway {
  STRIPE
  SSLCOMMERZ
}

// 🆕 HR Scope Enum
enum HrScope {
  COMPANY_WIDE     // Manages all departments
  DEPARTMENT_SPECIFIC // Manages specific department only
  REGIONAL         // Manages specific region
}

// ─── COMPANY (TENANT) ───────────────────────────────────

model Company {
  id                  String              @id @default(cuid())
  name                String
  logo                String?
  address             String?
  email               String?
  phone               String?
  taxId               String?
  website             String?
  fiscalYearStart     DateTime?
  fiscalYearEnd       DateTime?
  
  // Subscription
  subscriptionPlan    SubscriptionPlan    @default(FREE)
  subscriptionStatus  SubscriptionStatus  @default(TRIAL)
  subscriptionExpiry  DateTime?
  maxEmployees        Int                 @default(10)
  
  // 🔐 Stripe fields
  stripeCustomerId     String?             // Stripe customer ID
  stripeSubscriptionId String?             // Stripe subscription ID
  
  // 🇧🇩 SSLCommerz fields (যোগ করতে হবে)
  sslCommerzStoreId    String?             // SSLCommerz store ID for this company
  sslCommerzCustomerId String?             // SSLCommerz customer reference
  sslCommerzToken      String?             // Token for recurring payment (if supported)
  
  // Relations
  users               User[]
  superAdmins         SuperAdminProfile[]
  hrManagers          HrManagerProfile[]
  accountants         AccountantProfile[]
  deptHeads           DeptHeadProfile[]
  employees           EmployeeProfile[]
  departments         Department[]
  attendance          Attendance[]
  leaves              Leave[]
  payrolls            Payroll[]
  payments            Payment[]
  auditLogs           AuditLog[]
  leaveTypes          LeaveType[]
  subscriptionHistory SubscriptionHistory[]
  
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
}

// ─── BASE USER ─────────────────────────────────────────

model User {
  id                String              @id @default(cuid())
  email             String
  password          String
  role              Role                @default(EMPLOYEE)
  isActive          Boolean             @default(true)
  lastLoginAt       DateTime?
  
  companyId         String
  company           Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  // Role profiles
  platformSuperAdminProfile PlatformSuperAdminProfile?
  superAdminProfile SuperAdminProfile?
  hrManagerProfile  HrManagerProfile?
  accountantProfile AccountantProfile?
  deptHeadProfile   DeptHeadProfile?
  employeeProfile   EmployeeProfile?
  
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt
  
  @@unique([email, companyId])
  @@index([companyId])
  @@index([role])
}

// ─── ROLE PROFILES (with companyId) ────────────────────

// Platform Admin Model
model PlatformSuperAdminProfile {
  id              String         @id @default(cuid())
  userId          String         @unique
  user            User           @relation(fields: [userId], references: [id], onDelete: Cascade)
  fullName        String
  email           String
  createdAt       DateTime       @default(now())
  updatedAt       DateTime       @updatedAt
  
  @@index([userId])
}

model SuperAdminProfile {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  fullName            String
  phone               String?
  photoUrl            String?
  
  companyId           String
  company             Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  twoFactorEnabled    Boolean            @default(false)
  
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  
  @@index([companyId])
}

model HrManagerProfile {
  id                  String    @id @default(cuid())
  userId              String    @unique
  user                User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  fullName            String
  phone               String?
  photoUrl            String?
  employeeCode        String?
  
  // 🆕 Job Information
  designation         String?
  joinDate            DateTime?
  hrLicenseNumber     String?
  officePhone         String?
  bio                 String?
  
  // 🆕 Department Assignment (Optional)
  // NULL means Company Level HR Manager (manages all departments)
  // NOT NULL means Department-specific HR Manager
  departmentId        String?
  department          Department? @relation(fields: [departmentId], references: [id])
      
  designationId  String?
  designation    Designation?   @relation(fields: [designationId], references: [id])
  
  // 🆕 Scope of responsibility
  scope               HrScope     @default(COMPANY_WIDE)
  
  companyId           String
  company             Company     @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  createdAt           DateTime    @default(now())
  updatedAt           DateTime    @updatedAt
  
  @@index([companyId])
  @@index([employeeCode])
  @@index([departmentId])
  @@index([scope])
}

model AccountantProfile {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  fullName            String
  phone               String?
  photoUrl            String?
  employeeCode        String?
  joinDate            DateTime?
  caLicenseNumber     String?
  taxIdNumber         String?
  bankName            String?
  bankAccount         String?
  fiscalYearAccess    Boolean            @default(true)
  
  companyId           String
  company             Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  
  @@index([companyId])
}

model DepartmentHeadProfile {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  fullName            String
  phone               String?
  photoUrl            String?
  employeeCode        String?
  departmentId        String?
  department          Department?        @relation(fields: [departmentId], references: [id])
  designation         String?
  joinDate            DateTime?
  officeLocation      String?
  linkedinUrl         String?
  bio                 String?
  
  companyId           String
  company             Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)

  designationId  String?
  designation    Designation?   @relation(fields: [designationId], references: [id])
  
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  
  @@index([companyId])
  @@index([departmentId])
}

model EmployeeProfile {
  id                  String             @id @default(cuid())
  userId              String             @unique
  user                User               @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Personal Info
  firstName           String
  lastName            String
  phone               String?
  photoUrl            String?
  dateOfBirth         DateTime?
  gender              Gender?
  address             String?
  nidNumber           String?
  bloodGroup          String?
  
  // Job Info
  employeeCode        String
  departmentId        String?
  department          Department?        @relation(fields: [departmentId], references: [id])
  designationId       String?
  designation         Designation?       @relation(fields: [designationId], references: [id])
  joinDate            DateTime
  employmentType      EmploymentType     @default(FULL_TIME)
  status              EmployeeStatus     @default(ACTIVE)
  
  // Salary Info
  basicSalary         Float
  houseAllowance      Float              @default(0)
  medicalAllowance    Float              @default(0)
  transportAllowance  Float              @default(0)
  
  // Bank Info
  bankName            String?
  bankAccount         String?
  
  // Emergency Contact
  emergencyName       String?
  emergencyPhone      String?
  emergencyRelation   String?
  
  companyId           String
  company             Company            @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  attendances         Attendance[]
  leaves              Leave[]
  payrolls            Payroll[]
  
  createdAt           DateTime           @default(now())
  updatedAt           DateTime           @updatedAt
  
  @@unique([employeeCode, companyId])
  @@index([companyId])
  @@index([departmentId])
  @@index([designationId])
  @@index([status])
  @@index([joinDate])
}

// ─── DEPARTMENT & DESIGNATION ──────────────────────────

model Department {
  id              String            @id @default(cuid())
  name            String
  description     String?
  
  companyId       String
  company         Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  employees       EmployeeProfile[]
  departmentHeads       DepartmentHeadProfile[]
  designations    Designation[]
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@unique([name, companyId])
  @@index([companyId])
}

model Designation {
  id              String            @id @default(cuid())
  title           String
  description     String?
  departmentId    String
  department      Department        @relation(fields: [departmentId], references: [id], onDelete: Cascade)
  
  companyId       String
  company         Company           @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  employees       EmployeeProfile[]
  
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt
  
  @@unique([title, departmentId, companyId])
  @@index([companyId])
  @@index([departmentId])
}

// ─── ATTENDANCE ────────────────────────────────────────

model Attendance {
  id                String           @id @default(cuid())
  employeeId        String
  employee          EmployeeProfile  @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  date              DateTime
  status            AttendanceStatus @default(PRESENT)
  checkIn           DateTime?
  checkOut          DateTime?
  note              String?
  overtimeHours     Float?           @default(0)
  lateMinutes       Int?             @default(0)
  earlyExitMinutes  Int?             @default(0)
  approvedBy        String?
  approvedAt        DateTime?
  
  companyId         String
  company           Company          @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  createdAt         DateTime         @default(now())
  updatedAt DateTime @updatedAt
  
  @@unique([employeeId, date])
  @@index([companyId])
  @@index([date])
  @@index([status])
  @@index([employeeId, date])
}

// ─── LEAVE ─────────────────────────────────────────────

model LeaveType {
  id              String   @id @default(cuid())
  name            String
  description     String?
  daysAllowed     Int
  isPaid          Boolean  @default(true)
  isActive        Boolean  @default(true)
  
  companyId       String
  company         Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  leaves          Leave[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([name, companyId])
  @@index([companyId])
  @@index([isActive])
}

model Leave {
  id                  String          @id @default(cuid())
  employeeId          String
  employee            EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  leaveTypeId         String
  leaveType           LeaveType       @relation(fields: [leaveTypeId], references: [id])
  startDate           DateTime
  endDate             DateTime
  totalDays           Int
  reason              String
  attachmentUrl       String?
  status              LeaveStatus     @default(PENDING)
  reviewedById        String?
  reviewNote          String?
  approvedByHeadAt    DateTime?
  approvedByHRAt      DateTime?
  rejectedAt          DateTime?
  rejectedReason      String?
  
  companyId           String
  company             Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  @@index([companyId])
  @@index([employeeId])
  @@index([leaveTypeId])
  @@index([status])
  @@index([startDate, endDate])
}

// ─── PAYROLL ───────────────────────────────────────────

model Payroll {
  id                  String          @id @default(cuid())
  employeeId          String
  employee            EmployeeProfile @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  month               Int
  year                Int
  
  basicSalary         Float
  houseAllowance      Float           @default(0)
  medicalAllowance    Float           @default(0)
  transportAllowance  Float           @default(0)
  overtimePay         Float           @default(0)
  
  grossSalary         Float
  taxDeduction        Float           @default(0)
  pfDeduction         Float           @default(0)
  otherDeductions     Float           @default(0)
  totalDeductions     Float
  netSalary           Float
  
  status              PayrollStatus   @default(DRAFT)
  paidAt              DateTime?
  generatedById       String?
  approvedById        String?
  
  companyId           String
  company             Company         @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  createdAt           DateTime        @default(now())
  updatedAt           DateTime        @updatedAt
  
  @@unique([employeeId, month, year])
  @@index([companyId])
  @@index([status])
  @@index([month, year])
  @@index([employeeId, status])
}

// ─── SUBSCRIPTION & PAYMENT ────────────────────────────

// ✅ CORRECT: Platform-wide configuration (NOT per company)
model SubscriptionPlanConfig {
  id              String           @id @default(cuid())
  name            SubscriptionPlan @unique  // FREE, BASIC, PRO, ENTERPRISE
  displayName     String
  description     String?
  priceUSD        Float
  priceBDT        Float
  yearlyPriceUSD  Float?
  yearlyPriceBDT  Float?
  maxEmployees    Int
  features        Json
  isActive        Boolean          @default(true)
  sortOrder       Int              @default(0)
  popularBadge    Boolean          @default(false)
  
  // ⭐ NO companyId here! - This is PLATFORM level
  createdAt       DateTime         @default(now())
  updatedAt       DateTime         @updatedAt
}

model SubscriptionHistory {
  id              String           @id @default(cuid())
  companyId       String
  company         Company          @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  plan            SubscriptionPlan
  status          SubscriptionStatus
  startDate       DateTime
  endDate         DateTime
  paymentId       String?
  payment         Payment?         @relation(fields: [paymentId], references: [id])
  
  createdAt       DateTime         @default(now())
  
  @@index([companyId])
  @@index([startDate, endDate])
  @@index([status])
}

model Payment {
  id                      String         @id @default(cuid())
  companyId               String
  company                 Company        @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  gateway                 PaymentGateway
  plan                    SubscriptionPlan
  amountUSD               Float?
  amountBDT               Float?
  
  // Stripe fields
  stripePaymentIntentId   String?        @unique
  stripeInvoiceId         String?
  stripeSubscriptionId    String?
  
  // SSLCommerz fields
  sslTranId               String?        @unique
  sslValId                String?
  sslSessionKey           String?
  
  status                  PaymentStatus  @default(PENDING)
  paidAt                  DateTime?
  subscriptionStart       DateTime?
  subscriptionEnd         DateTime?
  transactionId           String?        @unique
  
  subscriptionHistory     SubscriptionHistory?
  
  createdAt               DateTime       @default(now())
  updatedAt               DateTime       @updatedAt
  
  @@index([companyId])
  @@index([status])
  @@index([paidAt])
}

// ─── AUDIT LOG ─────────────────────────────────────────

model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  targetType  String
  targetId    String?
  details     Json?
  ipAddress   String?
  userAgent   String?
  
  companyId   String
  company     Company  @relation(fields: [companyId], references: [id], onDelete: Cascade)
  
  createdAt   DateTime @default(now())
  
  @@index([companyId])
  @@index([userId])
  @@index([createdAt])
  @@index([action])
  @@index([targetType, targetId])
}
```

---

## 8. Payment Integration

Zentro-তে দুটো payment gateway আছে:

- **Stripe** — International users-দের জন্য (USD)
- **SSLCommerz** — বাংলাদেশী users-দের জন্য (BDT)

---

### 📦 Subscription Plans

| Plan  | Price (USD) | Price (BDT) | Max Employees | Features                         |
| ----- | ----------- | ----------- | ------------- | -------------------------------- |
| FREE  | $0          | ৳0          | 10            | Basic HR, Attendance, Leave      |
| BASIC | $19/mo      | ৳2,100/mo   | 50            | + Payroll, Reports               |
| PRO   | $49/mo      | ৳5,400/mo   | 200           | + PDF Payslip, Audit Log, Charts |

| ENTERPRISE $99/mo | ৳10,900/mo | Unlimited | + Priority Support, Custom Settings |

---

### 💳 Stripe Integration (International)

#### Install

```bash
# Backend
npm install stripe

# Frontend
npm install @stripe/stripe-js @stripe/react-stripe-js
```

#### Backend — Create Payment Intent

```typescript
// backend/src/services/stripe.service.ts
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export const createStripeCheckout = async (
  planName: string,
  priceUSD: number,
  customerEmail: string,
  stripeCustomerId?: string,
) => {
  // Create or retrieve customer
  let customer = stripeCustomerId
    ? await stripe.customers.retrieve(stripeCustomerId)
    : await stripe.customers.create({ email: customerEmail });

  // Create checkout session
  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    mode: "subscription",
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: Math.round(priceUSD * 100), // cents
          recurring: { interval: "month" },
          product_data: { name: `Zentro ${planName} Plan` },
        },
        quantity: 1,
      },
    ],
    success_url: `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=success`,
    cancel_url: `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=cancelled`,
    metadata: { planName },
  });

  return session;
};
```

#### Backend — Stripe Webhook

```typescript
// backend/src/routes/payment.routes.ts
import express from "express";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const router = express.Router();

// Stripe webhook — payment success হলে subscription update করো
router.post(
  "/webhook/stripe",
  express.raw({ type: "application/json" }), // raw body দরকার
  async (req, res) => {
    const sig = req.headers["stripe-signature"]!;
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET!,
      );
    } catch (err) {
      return res.status(400).send(`Webhook Error`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.CheckoutSession;
      const planName = session.metadata?.planName;
      const customerEmail = session.customer_details?.email;

      // Database update করো
      await updateSubscription({
        email: customerEmail!,
        plan: planName!,
        gateway: "STRIPE",
        stripePaymentIntentId: session.payment_intent as string,
        subscriptionStart: new Date(),
        subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        status: "SUCCESS",
      });
    }

    res.json({ received: true });
  },
);

export default router;
```

#### Frontend — Stripe Checkout Button

```typescript
// frontend/components/billing/StripeCheckoutButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  planName: string;
  priceUSD: number;
}

export function StripeCheckoutButton({ planName, priceUSD }: Props) {
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    setLoading(true);
    const res = await fetch('/api/payments/stripe/create-checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName, priceUSD }),
    });
    const { url } = await res.json();
    window.location.href = url; // Stripe hosted checkout page-এ redirect
    setLoading(false);
  };

  return (
    <Button onClick={handleCheckout} disabled={loading}>
      {loading ? 'Redirecting...' : `Pay $${priceUSD}/month`}
    </Button>
  );
}
```

---

### 🇧🇩 SSLCommerz Integration (Bangladesh)

#### Install

```bash
npm install sslcommerz-lts
```

#### Backend — Initiate SSLCommerz Payment

```typescript
// backend/src/services/sslcommerz.service.ts
import SSLCommerzPayment from "sslcommerz-lts";

const store_id = process.env.SSLCOMMERZ_STORE_ID!;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASSWORD!;
const is_live = process.env.NODE_ENV === "production"; // false = sandbox

export const initiateSSLCommerzPayment = async (
  tranId: string,
  amountBDT: number,
  planName: string,
  customerName: string,
  customerEmail: string,
  customerPhone: string,
) => {
  const data = {
    total_amount: amountBDT,
    currency: "BDT",
    tran_id: tranId,
    success_url: `${process.env.BACKEND_URL}/api/payments/sslcommerz/success`,
    fail_url: `${process.env.BACKEND_URL}/api/payments/sslcommerz/fail`,
    cancel_url: `${process.env.BACKEND_URL}/api/payments/sslcommerz/cancel`,
    ipn_url: `${process.env.BACKEND_URL}/api/payments/sslcommerz/ipn`,
    product_name: `Zentro ${planName} Plan`,
    product_category: "Software Subscription",
    product_profile: "general",
    cus_name: customerName,
    cus_email: customerEmail,
    cus_phone: customerPhone,
    cus_add1: "Dhaka",
    cus_city: "Dhaka",
    cus_country: "Bangladesh",
    shipping_method: "NO",
    num_of_item: 1,
  };

  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const response = await sslcz.init(data);
  return response; // GatewayPageURL থাকবে এখানে
};
```

#### Backend — SSLCommerz Success Handler

```typescript
// backend/src/routes/payment.routes.ts

// SSLCommerz payment success হলে এই route-এ আসবে (POST)
router.post("/sslcommerz/success", async (req, res) => {
  const { tran_id, val_id, status, amount, currency } = req.body;

  if (status !== "VALID") {
    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=failed`,
    );
  }

  // Validate the transaction with SSLCommerz
  const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);
  const validation = await sslcz.validate({ val_id });

  if (validation.status === "VALID" || validation.status === "VALIDATED") {
    // Database update করো
    await updateSubscription({
      sslTranId: tran_id,
      sslValId: val_id,
      status: "SUCCESS",
      gateway: "SSLCOMMERZ",
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    return res.redirect(
      `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=success`,
    );
  }

  res.redirect(
    `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=failed`,
  );
});

router.post("/sslcommerz/fail", (req, res) => {
  res.redirect(
    `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=failed`,
  );
});

router.post("/sslcommerz/cancel", (req, res) => {
  res.redirect(
    `${process.env.FRONTEND_URL}/dashboard/settings/billing?payment=cancelled`,
  );
});
```

#### Frontend — SSLCommerz Checkout Button

```typescript
// frontend/components/billing/SSLCommerzCheckoutButton.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';

interface Props {
  planName: string;
  priceBDT: number;
}

export function SSLCommerzCheckoutButton({ planName, priceBDT }: Props) {
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    setLoading(true);
    const res = await fetch('/api/payments/sslcommerz/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ planName, priceBDT }),
    });
    const { GatewayPageURL } = await res.json();
    window.location.href = GatewayPageURL; // SSLCommerz payment page-এ redirect
    setLoading(false);
  };

  return (
    <Button onClick={handlePayment} disabled={loading} variant="outline">
      {loading ? 'Redirecting...' : `Pay ৳${priceBDT}/month`}
    </Button>
  );
}
```

---

### 🧾 Billing Page — Payment Method Selection

```typescript
// frontend/app/dashboard/settings/billing/page.tsx
// User দেখবে দুটো option: Stripe (USD) বা SSLCommerz (BDT)

<div className="flex gap-4">
  {/* International Payment */}
  <StripeCheckoutButton planName="PRO" priceUSD={49} />

  {/* Bangladesh Payment */}
  <SSLCommerzCheckoutButton planName="PRO" priceBDT={5400} />
</div>
```

---

### Payment API Routes

| Method | Route                              | Access              | Description                    |
| ------ | ---------------------------------- | ------------------- | ------------------------------ |
| POST   | `/payments/stripe/create-checkout` | SUPER_ADMIN         | Create Stripe checkout session |
| POST   | `/webhook/stripe`                  | Public (Stripe)     | Stripe webhook handler         |
| POST   | `/payments/sslcommerz/initiate`    | SUPER_ADMIN         | Initiate SSLCommerz payment    |
| POST   | `/payments/sslcommerz/success`     | Public (SSLCommerz) | Payment success handler        |
| POST   | `/payments/sslcommerz/fail`        | Public (SSLCommerz) | Payment fail handler           |
| POST   | `/payments/sslcommerz/cancel`      | Public (SSLCommerz) | Payment cancel handler         |
| GET    | `/payments/history`                | SUPER_ADMIN         | All payment history            |
| GET    | `/payments/subscription`           | SUPER_ADMIN         | Current subscription status    |

---

## 9. API Routes

### Base URL: `http://localhost:5000/api`

### 🔐 Auth Routes

| Method | Route                   | Access | Description       |
| ------ | ----------------------- | ------ | ----------------- |
| POST   | `/auth/login`           | Public | Login             |
| POST   | `/auth/logout`          | Auth   | Logout            |
| POST   | `/auth/forgot-password` | Public | Send reset email  |
| POST   | `/auth/reset-password`  | Public | Reset password    |
| GET    | `/auth/me`              | Auth   | Current user info |

### 👤 Profile Routes

| Method | Route            | Access | Description                  |
| ------ | ---------------- | ------ | ---------------------------- |
| GET    | `/profile`       | Auth   | Get own profile (role-based) |
| PUT    | `/profile`       | Auth   | Update own profile           |
| PUT    | `/profile/photo` | Auth   | Upload profile photo         |

### 👥 Employee Routes

| Method | Route            | Access                                         | Description         |
| ------ | ---------------- | ---------------------------------------------- | ------------------- |
| GET    | `/employees`     | SUPER_ADMIN, HR_MANAGER, ACCOUNTANT, DEPT_HEAD | Get all employees   |
| POST   | `/employees`     | SUPER_ADMIN, HR_MANAGER                        | Create employee     |
| GET    | `/employees/:id` | Auth                                           | Get employee detail |
| PUT    | `/employees/:id` | SUPER_ADMIN, HR_MANAGER                        | Update employee     |
| DELETE | `/employees/:id` | SUPER_ADMIN                                    | Soft delete         |

### 🏢 Department Routes

| Method | Route              | Access                  | Description      |
| ------ | ------------------ | ----------------------- | ---------------- |
| GET    | `/departments`     | Auth                    | All departments  |
| POST   | `/departments`     | SUPER_ADMIN, HR_MANAGER | Create           |
| PUT    | `/departments/:id` | SUPER_ADMIN, HR_MANAGER | Update           |
| DELETE | `/departments/:id` | SUPER_ADMIN             | Delete           |
| GET    | `/designations`    | Auth                    | All designations |
| POST   | `/designations`    | SUPER_ADMIN, HR_MANAGER | Create           |

### 📅 Attendance Routes

| Method | Route                        | Access                             | Description         |
| ------ | ---------------------------- | ---------------------------------- | ------------------- |
| GET    | `/attendance`                | SUPER_ADMIN, HR_MANAGER, DEPT_HEAD | All attendance      |
| POST   | `/attendance/mark`           | SUPER_ADMIN, HR_MANAGER            | Mark attendance     |
| GET    | `/attendance/employee/:id`   | Auth                               | Employee attendance |
| PUT    | `/attendance/:id`            | SUPER_ADMIN, HR_MANAGER            | Edit record         |
| GET    | `/attendance/report/monthly` | SUPER_ADMIN, HR_MANAGER            | Monthly report      |

### 🏖️ Leave Routes

| Method | Route                         | Access                             | Description                    |
| ------ | ----------------------------- | ---------------------------------- | ------------------------------ |
| GET    | `/leaves`                     | Auth                               | Leave requests (role filtered) |
| POST   | `/leaves`                     | Auth                               | Apply for leave                |
| GET    | `/leaves/:id`                 | Auth                               | Leave detail                   |
| PUT    | `/leaves/:id/approve`         | SUPER_ADMIN, HR_MANAGER, DEPT_HEAD | Approve/reject                 |
| GET    | `/leaves/balance/:employeeId` | Auth                               | Leave balance                  |
| GET    | `/leave-types`                | Auth                               | All leave types                |
| POST   | `/leave-types`                | SUPER_ADMIN                        | Create leave type              |

### 💰 Payroll Routes

| Method | Route                   | Access                  | Description              |
| ------ | ----------------------- | ----------------------- | ------------------------ |
| GET    | `/payroll`              | SUPER_ADMIN, ACCOUNTANT | All payrolls             |
| POST   | `/payroll/generate`     | SUPER_ADMIN, ACCOUNTANT | Generate payroll         |
| GET    | `/payroll/:id`          | Auth                    | Payroll detail           |
| PUT    | `/payroll/:id/approve`  | SUPER_ADMIN             | Approve                  |
| PUT    | `/payroll/:id/pay`      | SUPER_ADMIN, ACCOUNTANT | Mark as paid             |
| GET    | `/payroll/employee/:id` | Auth                    | Employee payroll history |
| GET    | `/payroll/:id/payslip`  | Auth                    | Payslip data             |

### 📊 Report Routes

| Method | Route                           | Access                  | Description                   |
| ------ | ------------------------------- | ----------------------- | ----------------------------- |
| GET    | `/reports/dashboard`            | Auth                    | Role-specific dashboard stats |
| GET    | `/reports/hr/headcount`         | SUPER_ADMIN, HR_MANAGER | Headcount by dept             |
| GET    | `/reports/hr/attendance`        | SUPER_ADMIN, HR_MANAGER | Attendance rate               |
| GET    | `/reports/hr/leave`             | SUPER_ADMIN, HR_MANAGER | Leave usage                   |
| GET    | `/reports/financial/payroll`    | SUPER_ADMIN, ACCOUNTANT | Payroll summary               |
| GET    | `/reports/financial/department` | SUPER_ADMIN, ACCOUNTANT | Dept salary expense           |

### ⚙️ Settings Routes

| Method | Route                        | Access      | Description     |
| ------ | ---------------------------- | ----------- | --------------- |
| GET    | `/settings/company`          | Auth        | Company profile |
| PUT    | `/settings/company`          | SUPER_ADMIN | Update company  |
| GET    | `/settings/audit-log`        | SUPER_ADMIN | Audit logs      |
| GET    | `/settings/users`            | SUPER_ADMIN | All users       |
| PUT    | `/settings/users/:id/role`   | SUPER_ADMIN | Change role     |
| PUT    | `/settings/users/:id/status` | SUPER_ADMIN | Toggle active   |

---

## 10. Folder Structure

```
zentro/
│
├── frontend/                          # Next.js App
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/page.tsx
│   │   │   ├── forgot-password/page.tsx
│   │   │   └── reset-password/page.tsx
│   │   ├── dashboard/
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   ├── profile/page.tsx
│   │   │   ├── employees/
│   │   │   ├── departments/
│   │   │   ├── attendance/
│   │   │   ├── leave/
│   │   │   ├── payroll/
│   │   │   ├── reports/
│   │   │   └── settings/
│   │   │       ├── company/page.tsx
│   │   │       ├── billing/page.tsx       # Subscription & payment
│   │   │       ├── users/page.tsx
│   │   │       └── audit-log/page.tsx
│   ├── components/
│   │   ├── ui/                            # Shadcn components
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx
│   │   │   ├── Header.tsx
│   │   │   └── RoleGuard.tsx
│   │   ├── profile/
│   │   │   ├── SuperAdminProfile.tsx
│   │   │   ├── HrManagerProfile.tsx
│   │   │   ├── AccountantProfile.tsx
│   │   │   ├── DeptHeadProfile.tsx
│   │   │   └── EmployeeProfile.tsx
│   │   ├── billing/
│   │   │   ├── PlanCard.tsx
│   │   │   ├── StripeCheckoutButton.tsx
│   │   │   ├── SSLCommerzCheckoutButton.tsx
│   │   │   └── PaymentHistory.tsx
│   │   ├── employees/
│   │   ├── payroll/
│   │   └── charts/
│   ├── hooks/
│   │   ├── useProfile.ts
│   │   ├── useEmployees.ts
│   │   ├── usePayroll.ts
│   │   └── useLeave.ts
│   ├── lib/
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   └── utils.ts
│   └── types/index.ts
│
└── backend/                             # Express.js API
    ├── src/
    │   ├── index.ts
    │   ├── prisma/schema.prisma
    │   ├── routes/
    │   │   ├── auth.routes.ts
    │   │   ├── profile.routes.ts
    │   │   ├── employee.routes.ts
    │   │   ├── department.routes.ts
    │   │   ├── attendance.routes.ts
    │   │   ├── leave.routes.ts
    │   │   ├── payroll.routes.ts
    │   │   ├── payment.routes.ts         # Stripe + SSLCommerz
    │   │   ├── report.routes.ts
    │   │   └── settings.routes.ts
    │   ├── controllers/
    │   ├── middlewares/
    │   │   ├── auth.middleware.ts
    │   │   └── role.middleware.ts
    │   ├── services/
    │   │   ├── payroll.service.ts
    │   │   ├── leave.service.ts
    │   │   ├── stripe.service.ts         # Stripe logic
    │   │   └── sslcommerz.service.ts     # SSLCommerz logic
    │   └── utils/helpers.ts
    └── package.json
```

---

## 11. Development Roadmap

### 🟦 Phase 1: Project Setup (Week 1)

- [ ] Create GitHub repository (name: zentro)
- [ ] Initialize Next.js frontend with TypeScript
- [ ] Initialize Express.js backend with TypeScript
- [ ] Setup PostgreSQL + Prisma, run initial migration
- [ ] Setup Better Auth
- [ ] Install Shadcn UI + Tailwind
- [ ] Setup TanStack Query

**Deliverable:** Both servers running, database connected

---

### 🟦 Phase 2: Auth & Role Profiles (Week 2)

- [ ] Build Login page with TanStack Form
- [ ] JWT session with httpOnly cookie
- [ ] `auth.middleware.ts` + `role.middleware.ts`
- [ ] Role-based dashboard layout + sidebar
- [ ] `RoleGuard` component
- [ ] Build profile pages for all 5 roles
- [ ] Profile photo upload (Cloudinary)
- [ ] Forgot / Reset password flow

**Deliverable:** Auth system + all 5 role profile pages

---

### 🟦 Phase 3: Employee Management (Week 3)

- [ ] Employee list with search & filter
- [ ] Add/Edit/Deactivate employee
- [ ] Employee detail page
- [ ] Employee API (CRUD)

**Deliverable:** Full employee management

---

### 🟦 Phase 4: Department & Designation (Week 4)

- [ ] Department & designation CRUD
- [ ] Assign department head
- [ ] Department API

**Deliverable:** Department system complete

---

### 🟦 Phase 5: Attendance (Week 5)

- [ ] Daily attendance marking (bulk)
- [ ] Attendance calendar per employee
- [ ] Monthly report + chart
- [ ] Attendance API

**Deliverable:** Full attendance system

---

### 🟦 Phase 6: Leave Management (Week 6)

- [ ] Leave application form
- [ ] Multi-step approval workflow
- [ ] Leave balance tracking
- [ ] Leave API

**Deliverable:** Full leave system

---

### 🟦 Phase 7: Payroll (Week 7–8)

- [ ] Payroll generation form
- [ ] Salary calculation service
  - `netSalary = basic + allowances + overtime - tax - pf - deductions`
- [ ] Approve & mark-as-paid flow
- [ ] PDF payslip with React PDF
- [ ] Payroll API

**Deliverable:** Full payroll + PDF payslip

---

### 🟦 Phase 8: Dashboard & Reports (Week 9)

- [ ] 5 role-specific dashboards
- [ ] Charts with Recharts (bar, line, pie, area)
- [ ] HR + Financial report pages
- [ ] Report API

**Deliverable:** All dashboards with charts

---

### 🟦 Phase 9: Payment Integration (Week 10)

- [ ] Setup Stripe account + get API keys
- [ ] Setup SSLCommerz sandbox account
- [ ] Build subscription plan page (4 plans)
- [ ] Stripe checkout flow (backend + frontend)
- [ ] SSLCommerz checkout flow (backend + frontend)
- [ ] Stripe webhook handler
- [ ] SSLCommerz success/fail/cancel handlers
- [ ] Subscription status update in database
- [ ] Payment history page
- [ ] Restrict features based on plan (employee limit check)

**Deliverable:** Full payment system with both gateways

---

### 🟦 Phase 10: Settings & Audit Log (Week 11)

- [ ] Company settings page
- [ ] User management (role change, activate/deactivate)
- [ ] Leave type configuration
- [ ] Audit log (record every important action)
- [ ] Audit log viewer

**Deliverable:** Settings + audit trail

---

### 🟦 Phase 11: Polish & Deploy (Week 12)

- [ ] Loading skeletons + empty states
- [ ] Toast notifications (Sonner)
- [ ] Mobile responsive check
- [ ] README.md with screenshots + live link
- [ ] Deploy frontend → Vercel
- [ ] Deploy backend → Railway
- [ ] Deploy database → Supabase / Neon
- [ ] End-to-end testing for all 5 roles

**Deliverable:** Live deployed Zentro app ✅

---

## 12. Environment Variables

### Frontend (`.env.local`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_APP_NAME=Zentro
BETTER_AUTH_SECRET=your_secret_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxx
```

### Backend (`.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/zentro
PORT=5000
JWT_SECRET=your_jwt_secret_here
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:5000

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your@gmail.com
SMTP_PASS=your_app_password

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=sk_test_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx

# SSLCommerz
SSLCOMMERZ_STORE_ID=your_store_id
SSLCOMMERZ_STORE_PASSWORD=your_store_password
```

---

## 13. Deployment Guide

### Step 0: Seed Platform Admin (First Time Only)

```bash
curl -X POST https://your-api.com/api/platform/setup \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@zentro.com","password":"SecurePass123","fullName":"Zentro Owner"}'

### Step 1: Database — Supabase (Free)

1. [supabase.com](https://supabase.com) → Create project
2. Copy Connection String → paste as `DATABASE_URL`
3. Run: `npx prisma migrate deploy`

### Step 2: Backend — Railway (Free)

1. [railway.app](https://railway.app) → New project → Connect GitHub
2. Add all backend `.env` variables
3. Auto-deploys on every push

### Step 3: Frontend — Vercel (Free)

1. [vercel.com](https://vercel.com) → Import GitHub repo
2. Add `NEXT_PUBLIC_API_URL` = Railway URL
3. Add `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
4. Deploy!

### Step 4: Stripe Webhook (Production)

1. Stripe Dashboard → Webhooks → Add endpoint
2. URL: `https://your-railway-url/api/webhook/stripe`
3. Events: `checkout.session.completed`, `invoice.payment_succeeded`
4. Copy Webhook Secret → add to Railway env as `STRIPE_WEBHOOK_SECRET`

### Step 5: SSLCommerz (Production)

1. [sslcommerz.com](https://sslcommerz.com) → Register merchant
2. Get live `store_id` and `store_password`
3. Update `is_live = true` in sslcommerz.service.ts
4. Update success/fail/cancel URLs to production URLs


---

## 🚀 Quick Start (Local Development)

```bash
# Clone the repo
git clone https://github.com/yourusername/zentro.git

# Backend setup
cd backend
npm install
npx prisma migrate dev
npm run dev   # Runs on http://localhost:5000

# Frontend setup (new terminal)
cd frontend
npm install
npm run dev   # Runs on http://localhost:3000
```

---

## 📎 All Required Libraries

```bash
# Frontend
npm install @tanstack/react-query @tanstack/react-form
npm install @react-pdf/renderer
npm install recharts
npm install sonner
npm install date-fns
npm install axios
npm install @stripe/stripe-js @stripe/react-stripe-js

# Backend
npm install express prisma @prisma/client
npm install better-auth
npm install bcryptjs jsonwebtoken
npm install nodemailer
npm install cloudinary multer
npm install zod
npm install stripe
npm install sslcommerz-lts
npm install cors helmet express-rate-limit
```

---

_Documentation for Zentro — HR & Payroll ERP System_
_Stack: Next.js · Express.js · Prisma · PostgreSQL · Better Auth · TanStack · Stripe · SSLCommerz_
