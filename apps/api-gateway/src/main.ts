import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { GrpcErrorsInterceptor } from './interceptors/grpc-errors.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new GrpcErrorsInterceptor());
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
