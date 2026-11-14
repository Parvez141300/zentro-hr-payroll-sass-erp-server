import { app } from "./app";
import { prisma } from "./app/lib/prisma";
import { envVars } from "./app/utils/env";
import { seedPlatformSuperAdmin } from "./scripts/seedPlatformSuperAdmin";

const port = envVars.PORT || 5000; // The port your express server will be running on.


const bootstrap = async () => {
    try {
        // connect to prisma
        await prisma.$connect();
        // seed super admin first time when run the server
        await seedPlatformSuperAdmin();
        // Start the server
        app.listen(port, () => {
            console.log(`Zentro Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.log(`Failed to start server`, error);
        // disconnect prisma if server fails
        await prisma.$disconnect();
        process.exit(1);
    }
}

bootstrap();