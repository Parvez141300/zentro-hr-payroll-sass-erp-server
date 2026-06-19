import { app } from "./app";
import { envVars } from "./app/utils/env";

const port = envVars.PORT || 5000; // The port your express server will be running on.


const bootstrap = async () => {
    try {
        // Start the server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    } catch (error) {
        console.log(`Failed to start server`, error);
    }
}

bootstrap();