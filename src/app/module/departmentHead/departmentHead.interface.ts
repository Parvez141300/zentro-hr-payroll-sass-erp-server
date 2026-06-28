export interface IUpdateDepartmentHeadPayload {
    name?: string;
    phone?: string;
    photoUrl?: string;
    employeeCode?: string;
    officeLocation?: string;
    linkedinUrl?: string;
    bio?: string;
    joinDate?: Date;
    
    departmentId?: string;
    designationId?: string;
}