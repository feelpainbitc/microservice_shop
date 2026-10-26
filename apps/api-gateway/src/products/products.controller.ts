import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Query,
  Post,
  Delete,
  Patch,
  ParseIntPipe,
} from '@nestjs/common';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/jwt.guard.js';
import { firstValueFrom } from 'rxjs';

import { ApiOperation, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateProductDto, UpdateProductDto } from '@microservices-shop/dto';

import * as microservices from '@nestjs/microservices';

interface CatalogService {
  getProduct(data: { id: number }): any;
  getProducts(data: {}): any;
  getProductByName(data: { name: string }): any;
  addProduct(data: { name: string; description: string; price: number }): any;
  updateProduct(data: {
    id: number;
    name: string;
    description: string;
    price: number;
  }): any;
  deleteProduct(data: { id: number }): any;
}

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  private catalogService: CatalogService;

  constructor(
    @Inject('CATALOG_PACKAGE')
    private readonly client: microservices.ClientGrpc,
  ) {}

  onModuleInit() {
    this.catalogService =
      this.client.getService<CatalogService>('CatalogService');
  }

  @Get()
  // @UseGuards(JwtGuard)
  @ApiOperation({ summary: 'Получить все товары' })
  @ApiResponse({ status: 200, description: 'Объект товара' })
  getAll() {
    return this.catalogService.getProducts({});
  }
  @Get('search')
  getProductByName(@Query('name') name: string) {
    console.log(name);
    return this.catalogService.getProductByName({ name });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить товар по Id' })
  @ApiResponse({ status: 200, description: 'Объект товара' })
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProduct({
      id: Number(id),
    });
  }

  @Post()
  @ApiOperation({ summary: 'Создать товар' })
  @ApiBody({ type: CreateProductDto })
  @ApiResponse({ status: 201, description: 'Товар создан' })
  addProduct(
    @Body() product: { name: string; description: string; price: number },
  ) {
    return this.catalogService.addProduct(product);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Обновить товар' })
  @ApiBody({ type: UpdateProductDto })
  @ApiResponse({ status: 201, description: 'Товар обновлен' })
  updateProduct(
    @Param('id', ParseIntPipe) id: string,
    @Body() product: { name: string; description: string; price: number },
  ) {
    console.log('PATCH!!!');
    const newProduct = { ...product, id: Number(id) };
    console.log(newProduct);
    return this.catalogService.updateProduct(newProduct);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить товар' })
  @ApiResponse({ status: 200, description: 'Товар удален' })
  deleteProduct(@Param('id', ParseIntPipe) id: string) {
    const del = this.catalogService.deleteProduct({ id: Number(id) });
    console.log(del);
    return del;
  }
}
