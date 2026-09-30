import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.setGlobalPrefix('api/v1');
  const port = Number(process.env.PORT || 3000);
  await app.listen(port);
  console.log(`✅ VERSA backend running at http://localhost:${port}/api/v1`);
}

bootstrap();
