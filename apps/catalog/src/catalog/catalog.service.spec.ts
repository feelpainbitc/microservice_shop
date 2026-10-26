import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RpcException } from '@nestjs/microservices';
import { CatalogService } from './catalog.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('CatalogService', () => {
  let service: CatalogService;

  const prismaMock = {
    product: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  };

  const product = {
    id: 1,
    name: 'Keyboard',
    description: 'Mechanical keyboard',
    price: 100,
  };

  beforeEach(() => {
    vi.resetAllMocks();
    service = new CatalogService(prismaMock as unknown as PrismaService);
  });

  describe('findAll', () => {
    it('should return all products', async () => {
      prismaMock.product.findMany.mockResolvedValue([product]);

      await expect(service.findAll()).resolves.toEqual([product]);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith();
    });

    it('should return an empty array when there are no products', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await expect(service.findAll()).resolves.toEqual([]);
    });

    it('should propagate database errors', async () => {
      prismaMock.product.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.findAll()).rejects.toThrow('Database error');
    });
  });

  describe('findOneById', () => {
    it('should return a product by ID', async () => {
      prismaMock.product.findUnique.mockResolvedValue(product);

      await expect(service.findOneById(1)).resolves.toEqual(product);
      expect(prismaMock.product.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw RpcException when product does not exist', async () => {
      prismaMock.product.findUnique.mockResolvedValue(null);

      await expect(service.findOneById(999)).rejects.toBeInstanceOf(
        RpcException,
      );
    });
  });

  describe('findByName', () => {
    it('should search products by a case-insensitive name fragment', async () => {
      prismaMock.product.findMany.mockResolvedValue([product]);

      await expect(service.findByName('key')).resolves.toEqual([product]);
      expect(prismaMock.product.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: 'key',
            mode: 'insensitive',
          },
        },
      });
    });

    it('should return an empty array when no products match', async () => {
      prismaMock.product.findMany.mockResolvedValue([]);

      await expect(service.findByName('unknown')).resolves.toEqual([]);
    });
  });

  describe('addOne', () => {
    const dto = {
      name: '  Keyboard  ',
      description: 'Mechanical keyboard',
      price: 100,
    };

    it('should create a product and trim its name', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);
      prismaMock.product.create.mockResolvedValue({
        ...product,
        name: 'Keyboard',
      });

      const result = await service.addOne(dto);

      expect(prismaMock.product.findFirst).toHaveBeenCalledWith({
        where: {
          name: {
            equals: 'Keyboard',
            mode: 'insensitive',
          },
        },
      });
      expect(prismaMock.product.create).toHaveBeenCalledWith({
        data: {
          ...dto,
          name: 'Keyboard',
        },
      });
      expect(result.name).toBe('Keyboard');
    });

    it('should reject an empty product name', async () => {
      await expect(
        service.addOne({ ...dto, name: '   ' }),
      ).rejects.toBeInstanceOf(RpcException);

      expect(prismaMock.product.create).not.toHaveBeenCalled();
    });

    it.each([0, -1, Number.NaN, Number.POSITIVE_INFINITY])(
      'should reject invalid price: %s',
      async (price) => {
        await expect(service.addOne({ ...dto, price })).rejects.toBeInstanceOf(
          RpcException,
        );

        expect(prismaMock.product.create).not.toHaveBeenCalled();
      },
    );

    it('should reject a duplicate product name', async () => {
      prismaMock.product.findFirst.mockResolvedValue(product);

      await expect(service.addOne(dto)).rejects.toBeInstanceOf(RpcException);

      expect(prismaMock.product.create).not.toHaveBeenCalled();
    });

    it('should translate Prisma unique constraint errors', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);
      prismaMock.product.create.mockRejectedValue({
        code: 'P2002',
      });

      await expect(service.addOne(dto)).rejects.toBeInstanceOf(RpcException);
    });

    it('should propagate other database errors', async () => {
      prismaMock.product.findFirst.mockResolvedValue(null);
      prismaMock.product.create.mockRejectedValue(new Error('Database error'));

      await expect(service.addOne(dto)).rejects.toThrow('Database error');
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const updateData = { name: 'New Keyboard' };
      const updatedProduct = { ...product, ...updateData };

      prismaMock.product.update.mockResolvedValue(updatedProduct);

      await expect(service.updateProduct(1, updateData)).resolves.toEqual(
        updatedProduct,
      );
      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: updateData,
      });
    });

    it('should reject a non-positive price', async () => {
      await expect(service.updateProduct(1, { price: 0 })).rejects.toThrow();

      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });

    it('should translate P2025 into RpcException', async () => {
      prismaMock.product.update.mockRejectedValue({ code: 'P2025' });

      await expect(
        service.updateProduct(999, { name: 'Updated' }),
      ).rejects.toBeInstanceOf(RpcException);
    });

    it('should propagate other database errors', async () => {
      prismaMock.product.update.mockRejectedValue(new Error('Database error'));

      await expect(
        service.updateProduct(1, { name: 'Updated' }),
      ).rejects.toThrow('Database error');
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product and return a message', async () => {
      prismaMock.product.delete.mockResolvedValue(product);

      const result = await service.deleteProduct(1);

      expect(prismaMock.product.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toHaveProperty('message');
    });

    it('should translate P2025 into RpcException', async () => {
      prismaMock.product.delete.mockRejectedValue({ code: 'P2025' });

      await expect(service.deleteProduct(999)).rejects.toBeInstanceOf(
        RpcException,
      );
    });

    it('should propagate other database errors', async () => {
      prismaMock.product.delete.mockRejectedValue(new Error('Database error'));

      await expect(service.deleteProduct(1)).rejects.toThrow('Database error');
    });
  });

  describe('updateProductGrpc', () => {
    it('should update a product and exclude ID from update data', async () => {
      const updatedProduct = { ...product, name: 'Updated Keyboard' };
      prismaMock.product.update.mockResolvedValue(updatedProduct);

      await expect(
        service.updateProductGrpc({ id: 1, name: 'Updated Keyboard' }),
      ).resolves.toEqual(updatedProduct);

      expect(prismaMock.product.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: { name: 'Updated Keyboard' },
      });
    });

    it('should reject a non-positive price', async () => {
      await expect(
        service.updateProductGrpc({ id: 1, price: -10 }),
      ).rejects.toBeInstanceOf(RpcException);

      expect(prismaMock.product.update).not.toHaveBeenCalled();
    });

    it('should translate P2025 into RpcException', async () => {
      prismaMock.product.update.mockRejectedValue({ code: 'P2025' });

      await expect(
        service.updateProductGrpc({ id: 999, name: 'Updated' }),
      ).rejects.toBeInstanceOf(RpcException);
    });
  });
});
