import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateOrderDto } from './dto/create-order.dto.js';
import { AppException, ErrorCode } from '@microservices-shop/shared';
import { RpcException } from '@nestjs/microservices';
import { Inject } from '@nestjs/common';

import { OnModuleInit } from '@nestjs/common';
import { firstValueFrom, Observable } from 'rxjs';
import * as microservices from '@nestjs/microservices';

interface Product {
  id: number;
  name: string;
  price: number;
}

interface CatalogService {
  GetProduct(data: { id: number }): Observable<Product>;
}

@Injectable()
export class OrdersService {
  private catalogService: CatalogService;

  constructor(
    private readonly prisma: PrismaService,
    @Inject('CATALOG_PACKAGE')
    private readonly catalogClient: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.catalogService =
      this.catalogClient.getService<CatalogService>('CatalogService');
  }

  private isRecordNotFound(error: unknown): boolean {
    return (
      typeof error === 'object' &&
      error !== null &&
      'code' in error &&
      error.code === 'P2025'
    );
  }

  private rpcError(
    code: ErrorCode,
    message: string,
    statusCode: number,
  ): RpcException {
    return new RpcException(
      JSON.stringify({
        code,
        message,
        statusCode,
      }),
    );
  }
  private async validateOrderData(dto: CreateOrderDto) {
    try {
      if (!dto.items || dto.items.length === 0) {
        throw this.rpcError(
          ErrorCode.ORDER_ITEMS_EMPTY,
          'Поле товаров пустое',
          400,
        );
      }
      for (let item of dto.items) {
        if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw this.rpcError(
            ErrorCode.ORDER_INVALID_QUANTITY,
            'Неверное количество товаров',
            400,
          );
        }
        if (item.productId <= 0) {
          throw this.rpcError(
            ErrorCode.ORDER_INVALID_DATA,
            'Неверные данные',
            400,
          );
        }
        const product = await firstValueFrom(
          this.catalogService.GetProduct({ id: item.productId }),
        );
      }
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'details' in error &&
        typeof error.details === 'string'
      ) {
        try {
          const payload = JSON.parse(error.details);

          if (payload.code === ErrorCode.PRODUCT_NOT_FOUND) {
            throw this.rpcError(
              ErrorCode.ORDER_PRODUCTS_NOT_FOUND,
              'Один из товаров не найден в каталоге',
              404,
            );
          }
        } catch (parseError) {
          if (parseError instanceof RpcException) {
            throw parseError;
          }
        }
      }

      throw error;
    }
  }

  async getAllOrders() {
    const orders = await this.prisma.order.findMany({
      include: {
        items: true,
      },
    });
    if (!orders) {
      throw this.rpcError(ErrorCode.ORDER_NOT_FOUND, 'Заказов нет', 404);
    }
    return orders;
  }
  async getOrderById(id: number) {
    const order = await this.prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });
    if (!order) {
      throw this.rpcError(
        ErrorCode.ORDER_NOT_FOUND,
        `Заказ с таким id:${id} не найден`,
        404,
      );
    }
  }

  async addOrder(dto: CreateOrderDto) {
    await this.validateOrderData(dto);
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
