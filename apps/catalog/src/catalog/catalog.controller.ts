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
import { CatalogService } from './catalog.service.js';
import { CreateProductDto } from './dto/create-product.dto.js';
import { UpdateProductDto } from './dto/update-product.dto.js';

import { GrpcMethod } from '@nestjs/microservices';

@Controller('catalog')
export class CatalogController {
  constructor(private readonly catalogService: CatalogService) {}

  @Get()
  findAll() {
    return this.catalogService.findAll();
  }
  @GrpcMethod('CatalogService', 'GetProducts')
  async getProducts() {
    const products = await this.catalogService.findAll();

    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        price: Number(product.price),
      })),
    };
  }

  @Get(':id')
  findOneById(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.findOneById(id);
  }

  @GrpcMethod('CatalogService', 'GetProduct')
  async findOne(data: { id: number }) {
    const product = await this.catalogService.findOneById(data.id);

    if (!product) {
      return null;
    }

    return {
      id: product.id,
      name: product.name,
      description: product.description ?? '',
      price: Number(product.price),
    };
  }

  @Get('search')
  search(@Query('name') name: string) {
    console.log(name);
    console.log(typeof name);
    return this.catalogService.findByName(name);
  }
  @GrpcMethod('CatalogService', 'GetProductByName')
  async getProductByName(data: { name: string }) {
    console.log(1);
    console.log(data);
    const products = await this.catalogService.findByName(data.name);
    if (!products) {
      return null;
    }
    return {
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description ?? '',
        price: Number(product.price),
      })),
    };
  }

  @Post()
  addOne(@Body() createProductDto: CreateProductDto) {
    return this.catalogService.addOne(createProductDto);
  }

  @Patch(':id')
  updateOne(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.catalogService.updateProduct(id, updateProductDto);
  }

  @Delete(':id')
  deleteOne(@Param('id', ParseIntPipe) id: number) {
    return this.catalogService.deleteProduct(id);
  }
}
