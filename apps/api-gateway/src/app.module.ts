import { Module } from '@nestjs/common';

import { ProductsController } from './products/products.controller.js';

import { ClientsModule, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { AuthController } from './users/users.controller.js';
import { OrdersController } from './orders/orders.controller.js';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { JwtGuard } from './auth/jwt.guard.js';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'CATALOG_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'catalog',
          protoPath: join(process.cwd(), '../../libs/proto/catalog.proto'),
          url: 'localhost:5001',
        },
      },
      {
        name: 'USERS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'users',
          protoPath: join(process.cwd(), '../../libs/proto/users.proto'),
          url: 'localhost:5002',
        },
      },
      {
        name: 'ORDERS_PACKAGE',
        transport: Transport.GRPC,
        options: {
          package: 'orders',
          protoPath: join(process.cwd(), '../../libs/proto/orders.proto'),
          url: 'localhost:5003',
        },
      },
    ]),
    ConfigModule.forRoot({ isGlobal: true }),

    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),
      }),
    }),
  ],
  controllers: [ProductsController, AuthController, OrdersController],
  providers: [JwtGuard],
})
export class AppModule {}
