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

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

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
