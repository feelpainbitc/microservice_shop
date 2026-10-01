import { Controller, Get, Inject, Param, Query } from '@nestjs/common';

import * as microservices from '@nestjs/microservices';

interface CatalogService {
  getProduct(data: { id: number }): any;
  getProducts(data: {}): any;
  getProductByName(data: { name: string }): any;
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
}
