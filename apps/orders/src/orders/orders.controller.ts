import {
  Controller,
  Body,
  Get,
  Param,
  Post,
  ParseIntPipe,
  Patch,
  Delete,
  Query,
} from '@nestjs/common';
import { OrdersService } from './orders.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

import { GrpcMethod } from '@nestjs/microservices';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @GrpcMethod('OrdersService', 'GetAllOrders')
  async getAllOrders() {
    const orders = await this.ordersService.getAllOrders();
    return { orders };
  }

  @GrpcMethod('OrdersService', 'GetOrderById')
  async getOrderById(data: { id: number }) {
    const order = await this.ordersService.getOrderById(data.id);
    return { order };
  }
  @GrpcMethod('OrdersService', 'AddOrder')
  async addOneOrder(data: any) {
    const order = await this.ordersService.addOrder(data);
    return { order };
  }

  @Get()
  getAll() {
    return this.ordersService.getAllOrders();
  }

  @Get(':id')
  getOneById(@Param('id', ParseIntPipe) id: number) {
    console.log(id);
    return this.ordersService.getOrderById(id);
  }

  @Post()
  addOrder(@Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.addOrder(createOrderDto);
  }
}
