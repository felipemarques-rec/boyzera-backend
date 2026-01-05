"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./shim");
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
if (!global.crypto) {
    global.crypto = require('crypto');
}
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule);
    app.enableCors({
        origin: [
            'http://localhost:3000',
            'https://localhost:3000',
            process.env.FRONTEND_URL,
            /\.ngrok-free\.app$/,
            /\.ngrok\.io$/,
            /\.trycloudflare\.com$/,
        ].filter(Boolean),
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    });
    await app.listen(process.env.PORT ?? 5001);
}
bootstrap();
//# sourceMappingURL=main.js.map