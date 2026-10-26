import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { GrpcErrorsInterceptor } from './interceptors/grpc-errors.interceptor.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalInterceptors(new GrpcErrorsInterceptor());

  const config = new DocumentBuilder()
    .setTitle('Microservice Shop API')
    .setDescription('Microservices shop training APP')
    .setVersion('1.0')
    .addTag('shop')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, documentFactory);
  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
