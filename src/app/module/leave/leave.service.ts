import { ICreateLeaveTypePayload } from "../leaveType/leaveType.interface";

const applyForLeaveInDB = async (companyId: string, userId: string, payload: ICreateLeaveTypePayload) => {

}

export const leaveService = {
    applyForLeaveInDB,
}