import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.ORDERS_PORT ?? 3003;
  await app.listen(port);
  console.log(`ORDERS STARTED ON PORT=${port}!!!`);
}
await bootstrap();
