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
      package: 'catalog',
      protoPath: join(process.cwd(), 'src/proto/catalog.proto'),
      url: 'localhost:5001',
    },
  });

  const port = process.env.CATALOG_PORT ?? 3002;
  await app.listen(port);
  await app.startAllMicroservices();
  console.log(`CATALOG STARTED ON PORT=${port}!!!`);
  console.log(`CATALOG GRPC STARTED ON PORT=${5001}`);
}
await bootstrap();
