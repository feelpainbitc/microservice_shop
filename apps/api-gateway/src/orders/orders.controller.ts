import { Body, Controller, Inject, Post, Get, Param } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { OnModuleInit } from '@nestjs/common';

import * as microservices from '@nestjs/microservices';

interface OrdersService {
  getAllOrders(data: {}): any;
  getOrderById(data: { id: number }): any;
  addOrder(data: {
    items: {
      productId: number;
      quantity: number;
    }[];
  }): any;
}

@Controller('orders')
export class OrdersController implements OnModuleInit {
  private ordersService: OrdersService;

  constructor(
    @Inject('ORDERS_PACKAGE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.ordersService = this.client.getService<OrdersService>('OrdersService');
  }

  @Get()
  getAll() {
    return this.ordersService.getAllOrders({});
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.ordersService.getOrderById({
      id: Number(id),
    });
  }

  @Post()
  addOrder(
    @Body()
    data: {
      items: {
        productId: number;
        quantity: number;
      }[];
    },
  ) {
    return this.ordersService.addOrder(data);
  }
}
