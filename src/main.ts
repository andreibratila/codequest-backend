import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';

import * as cookieParser from 'cookie-parser';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set global prefix for all routes
  app.setGlobalPrefix('api');

  // Permit cookies
  app.use(cookieParser());

  // Set global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  if (process.env.NODE_ENV === 'development') {
    app.enableCors({
      origin: 'http://localhost:3000',
      methods: 'GET,PUT,PATCH,POST,DELETE',
      credentials: true,
    }); // In Development
  } else {
    // In Production you can set the origins
    app.enableCors({
      origin: ['https://devtalleslotery.com', 'https://lottery.devtalles.com'],
      methods: 'GET,PUT,PATCH,POST,DELETE',
      credentials: true,
    });
  }

  //Todo :helmet, rate limiter, etc
  await app.listen(+process.env.PORT);
  console.log(`Server running on port ${process.env.PORT}`);
}
bootstrap();
