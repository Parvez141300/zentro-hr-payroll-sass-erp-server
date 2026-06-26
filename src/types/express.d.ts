declare global {
    namespace Express {
        interface Request {
            user: {
                companyId: string;
                userId: string;
                name: string;
                email: string;
                role: string;
                isActive: boolean;
                isDeleted: boolean;
            };
        }
    }
}

export {}