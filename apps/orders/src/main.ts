import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { MicroserviceOptions } from '@nestjs/microservices';
import { Transport } from '@nestjs/microservices';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.GRPC,
    options: {
      package: 'orders',
      protoPath: join(process.cwd(), 'src/proto/orders.proto'),
      url: 'localhost:5003',
    },
  });
  const port = process.env.ORDERS_PORT ?? 3003;
  await app.listen(port);
  await app.startAllMicroservices();
  console.log(`ORDERS STARTED ON PORT=${port}!!!`);
  console.log(`ORDERS GRPC STARTED ON PORT=${5003}`);
}
await bootstrap();
