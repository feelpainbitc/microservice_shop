import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const products = await this.prisma.product.findMany();
    return products;
  }

  async findOneById(id: number) {
    console.log('+++');
    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });
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
    const newProduct = await this.prisma.product.create({
      data,
    });
    return newProduct;
  }

  async updateProduct(id: number, data: UpdateProductDto) {
    const updatedProduct = await this.prisma.product.update({
      where: {
        id,
      },
      data,
    });
    return updatedProduct;
  }

  async deleteProduct(id: number) {
    const deletedProduct = await this.prisma.product.delete({
      where: {
        id,
      },
    });
    return deletedProduct;
  }
}
