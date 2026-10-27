import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProductsController } from './products.controller.js';

describe('ProductsController', () => {
  const products = [
    {
      id: 1,
      name: 'Keyboard',
      description: 'Mechanical keyboard',
      price: 100,
    },
  ];

  const product = products[0];

  const catalogService = {
    getProducts: vi.fn(),
    getProduct: vi.fn(),
    getProductByName: vi.fn(),
    addProduct: vi.fn(),
    updateProduct: vi.fn(),
    deleteProduct: vi.fn(),
  };

  const client = {
    getService: vi.fn(),
  };

  let controller: ProductsController;

  beforeEach(() => {
    vi.clearAllMocks();

    catalogService.getProducts.mockReturnValue(products);
    catalogService.getProduct.mockReturnValue(product);
    catalogService.getProductByName.mockReturnValue(products);
    catalogService.addProduct.mockReturnValue(product);
    catalogService.updateProduct.mockReturnValue(product);
    catalogService.deleteProduct.mockReturnValue({ success: true });

    client.getService.mockReturnValue(catalogService);

    controller = new ProductsController(client as never);
    controller.onModuleInit();
  });

  it('should initialize CatalogService from gRPC client', () => {
    expect(client.getService).toHaveBeenCalledWith('CatalogService');
  });

  describe('getAll', () => {
    it('should request all products', () => {
      expect(controller.getAll()).toEqual(products);
      expect(catalogService.getProducts).toHaveBeenCalledWith({});
    });
  });

  describe('getProductByName', () => {
    it('should search products by name', () => {
      expect(controller.getProductByName('Keyboard')).toEqual(products);
      expect(catalogService.getProductByName).toHaveBeenCalledWith({
        name: 'Keyboard',
      });
    });
  });

  describe('getProduct', () => {
    it('should convert the product ID to a number', () => {
      expect(controller.getProduct('1')).toEqual(product);
      expect(catalogService.getProduct).toHaveBeenCalledWith({ id: 1 });
    });
  });

  describe('addProduct', () => {
    it('should pass product data to the catalog service', () => {
      const dto = {
        name: 'Mouse',
        description: 'Wireless mouse',
        price: 50,
      };

      expect(controller.addProduct(dto)).toEqual(product);
      expect(catalogService.addProduct).toHaveBeenCalledWith(dto);
    });
  });

  describe('updateProduct', () => {
    it('should include the numeric ID when updating a product', () => {
      const dto = {
        name: 'Updated keyboard',
        description: 'Updated description',
        price: 120,
      };

      expect(controller.updateProduct('1', dto)).toEqual(product);
      expect(catalogService.updateProduct).toHaveBeenCalledWith({
        ...dto,
        id: 1,
      });
    });
  });

  describe('deleteProduct', () => {
    it('should delete the product by numeric ID', () => {
      expect(controller.deleteProduct('1')).toEqual({ success: true });
      expect(catalogService.deleteProduct).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
