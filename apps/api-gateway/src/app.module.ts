import { Module } from '@nestjs/common';

import { ProductsController } from './products/products.controller.js';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthController } from './users/users.controller.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CATALOG_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'catalog',
          protoPath: join(process.cwd(), 'src/proto/catalog.proto'),
          url: 'localhost:5001',
        },
      },
      {
        name: 'USERS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'users',
          protoPath: join(process.cwd(), 'src/proto/users.proto'),
          url: 'localhost:5002',
        },
      },
    ]),
  ],
  controllers: [ProductsController, AuthController],
})
export class AppModule {}
