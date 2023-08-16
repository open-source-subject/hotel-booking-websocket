import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:3000', // Replace with the actual origin(s) you want to allow
    methods: ['GET', 'POST'], // Adjust the allowed methods
    credentials: true, // If you're sending credentials (e.g., cookies) cross-origin
  });
  await app.listen(8080);
}
bootstrap();
