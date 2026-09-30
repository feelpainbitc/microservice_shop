import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        items: true,
      },
    });
  }
  async getOrderById(id: number) {
    console.log(id);
    return this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });
  }

  async addOrder(dto: CreateOrderDto) {
    return this.prisma.order.create({
      data: {
        items: {
          create: dto.items,
        },
      },
      include: {
        items: true,
      },
    });
  }
}
