import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto, UpdateProductDto } from '@microservices-shop/dto';
import { AppException, ErrorCode } from '@microservices-shop/shared';
import { RpcException } from '@nestjs/microservices';

import { UseInterceptors } from '@nestjs/common';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

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
  private validateProductData(data: {
    name?: string;
    description?: string;
    price?: number;
  }) {
    if (data.name !== undefined && data.name.trim().length === 0) {
      throw this.rpcError(
        ErrorCode.PRODUCT_INVALID_DATA,
        'Название товара не может быть пустым',
        400,
      );
    }

    if (
      data.description !== undefined &&
      typeof data.description !== 'string'
    ) {
      throw this.rpcError(
        ErrorCode.PRODUCT_INVALID_DATA,
        'Некорректное описание товара',
        400,
      );
    }

    if (
      data.price !== undefined &&
      (!Number.isFinite(data.price) || data.price <= 0)
    ) {
      throw this.rpcError(
        ErrorCode.PRODUCT_INVALID_PRICE,
        'Цена должна быть больше 0',
        400,
      );
    }
  }
  private async ensureProductNameUnique(name: string, excludeId?: number) {
    const existingProduct = await this.prisma.product.findFirst({
      where: {
        name: {
          equals: name.trim(),
          mode: 'insensitive',
        },
        ...(excludeId !== undefined ? { id: { not: excludeId } } : {}),
      },
    });

    if (existingProduct) {
      throw this.rpcError(
        ErrorCode.PRODUCT_NAME_EXISTS,
        'Товар с таким названием уже существует',
        409,
      );
    }
  }

  async findAll() {
    const products = await this.prisma.product.findMany();
    if (!products) {
      throw this.rpcError(
        ErrorCode.PRODUCT_NOT_FOUND,
        'Товары не найдены',
        404,
      );
    }
    return products;
  }

  async findOneById(id: number) {
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
    console.log(product);
    if (product == null) {
      throw this.rpcError(ErrorCode.PRODUCT_NOT_FOUND, 'Товар не найден', 404);
    }
    return product;
  }
  async findByName(name: string) {
    console.log(2);
    console.log(name);
    return this.prisma.product.findMany({
      where: {
        name: {
          contains: name,
          mode: 'insensitive',
        },
      },
    });
  }

  async addOne(data: CreateProductDto) {
    this.validateProductData(data);

    await this.ensureProductNameUnique(data.name);
    try {
      return await this.prisma.product.create({
        data: {
          ...data,
          name: data.name.trim(),
        },
      });
    } catch (error) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        error.code === 'P2002'
      ) {
        throw this.rpcError(
          ErrorCode.PRODUCT_NAME_EXISTS,
          'Товар с таким названием уже существует',
          409,
        );
      }

      throw error;
    }
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    if (data.price !== undefined && data.price <= 0) {
      throw new AppException(
        ErrorCode.PRODUCT_INVALID_PRICE,
        'Цена товара должны быть больше 0',
        400,
      );
    }
    try {
      const updatedProduct = await this.prisma.product.update({
        where: {
          id,
        },
        data,
      });
      return updatedProduct;
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw this.rpcError(
          ErrorCode.PRODUCT_NOT_FOUND,
          'Такого товара не существует',
          404,
        );
      }
      throw error;
    }
  }

  async deleteProduct(id: number) {
    try {
      await this.prisma.product.delete({
        where: {
          id,
        },
      });
      return { message: `Товар с ${id} успешно удален!` };
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw this.rpcError(
          ErrorCode.PRODUCT_NOT_FOUND,
          'Такого товара не существует',
          404,
        );
      }
      throw error;
    }
  }
  async updateProductGrpc(data: {
    id: number;
    name?: string;
    description?: string;
    price?: number;
  }) {
    const { id, ...updateData } = data;

    if (updateData.price !== undefined && updateData.price <= 0) {
      throw this.rpcError(
        ErrorCode.PRODUCT_INVALID_PRICE,
        'Цена должна быть больше 0',
        400,
      );
    }
    try {
      return await this.prisma.product.update({
        where: { id },
        data: updateData,
      });
    } catch (error) {
      if (this.isRecordNotFound(error)) {
        throw this.rpcError(
          ErrorCode.PRODUCT_NOT_FOUND,
          'Такого товара не существует',
          404,
        );
      }
      throw error;
    }
  }
}
