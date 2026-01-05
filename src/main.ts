import './shim';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// Polyfill for Node < 19 where crypto is not global
if (!global.crypto) {
  global.crypto = require('crypto');
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS for Telegram Mini App
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
