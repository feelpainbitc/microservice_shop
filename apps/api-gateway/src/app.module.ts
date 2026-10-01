import { Module } from '@nestjs/common';

import { ProductsController } from './products/products.controller.js';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';

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
    ]),
  ],
  controllers: [ProductsController],
})
export class AppModule {}
