import { Body, Controller, Inject, Post, Get, Param } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { OnModuleInit } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from '@microservices-shop/dto';

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
  @ApiOperation({ summary: 'Получить все заказы' })
  @ApiResponse({ status: 200, description: 'Массив заказов' })
  getAll() {
    return this.ordersService.getAllOrders({});
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить заказ по id' })
  @ApiResponse({ status: 200, description: 'Объект заказа' })
  getById(@Param('id') id: string) {
    return this.ordersService.getOrderById({
      id: Number(id),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Создать заказ' })
  @ApiBody({ type: CreateOrderDto })
  @ApiResponse({ status: 201, description: 'Заказ создан' })
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
