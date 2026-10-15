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
} from '@nestjs/common';

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
  getAll() {
    return this.catalogService.getProducts({});
  }
  @Get('search')
  getProductByName(@Query('name') name: string) {
    console.log(name);
    return this.catalogService.getProductByName({ name });
  }

  @Get(':id')
  getProduct(@Param('id') id: string) {
    return this.catalogService.getProduct({
      id: Number(id),
    });
  }

  @Post()
  addProduct(
    @Body() product: { name: string; description: string; price: number },
  ) {
    return this.catalogService.addProduct(product);
  }

  @Patch(':id')
  updateProduct(
    @Param('id') id: string,
    @Body() product: { name: string; description: string; price: number },
  ) {
    console.log('PATCH!!!');
    const newProduct = { ...product, id: Number(id) };
    console.log(newProduct);
    return this.catalogService.updateProduct(newProduct);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.catalogService.deleteProduct({ id: Number(id) });
  }
}
