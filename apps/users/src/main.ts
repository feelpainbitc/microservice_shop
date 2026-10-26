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
      package: 'users',
      protoPath: join(process.cwd(), '../../libs/proto/users.proto'),
      url: '0.0.0.0:5002',
    },
  });
  const port = process.env.USERS_PORT ?? 3001;
  await app.listen(port);
  await app.startAllMicroservices();
  console.log(`USERS GRPC STARTED ON PORT=${port}!!!`);
  console.log(`USERS STARTED ON PORT=${port}!!!`);
}
await bootstrap();
