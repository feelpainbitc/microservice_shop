
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { RpcException } from '@nestjs/microservices';
import { of, throwError } from 'rxjs';
import { OrdersService } from './orders.service.js';
import { PrismaService } from '../prisma/prisma.service.js';

describe('OrdersService', () => {
  let service: OrdersService;

  const prismaMock = {
    order: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  };

  const catalogServiceMock = {
    GetProduct: vi.fn(),
  };

  const catalogClientMock = {
    getService: vi.fn(() => catalogServiceMock),
  };

  const order = {
    id: 1,
    status: 'CREATED',
    items: [{ productId: 10, quantity: 2 }],
  };

  beforeEach(() => {
    vi.resetAllMocks();

    catalogClientMock.getService.mockReturnValue(catalogServiceMock);

    service = new OrdersService(
      prismaMock as unknown as PrismaService,
      catalogClientMock as any,
    );

    service.onModuleInit();
  });

  describe('getAllOrders', () => {
    it('should return all orders with their items', async () => {
      prismaMock.order.findMany.mockResolvedValue([order]);

      await expect(service.getAllOrders()).resolves.toEqual([order]);

      expect(prismaMock.order.findMany).toHaveBeenCalledWith({
        include: { items: true },
      });
    });

    it('should return an empty array when there are no orders', async () => {
      prismaMock.order.findMany.mockResolvedValue([]);

      await expect(service.getAllOrders()).resolves.toEqual([]);
    });

    it('should propagate database errors', async () => {
      prismaMock.order.findMany.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getAllOrders()).rejects.toThrow('Database error');
    });
  });

  describe('getOrderById', () => {
    it('should return an order by ID', async () => {
      prismaMock.order.findUnique.mockResolvedValue(order);

      const result = await service.getOrderById(1);

      // This assertion exposes a missing return in the current service.
      expect(result).toEqual(order);

      expect(prismaMock.order.findUnique).toHaveBeenCalledWith({
        where: { id: 1 },
        include: { items: true },
      });
    });

    it('should throw RpcException when the order does not exist', async () => {
      prismaMock.order.findUnique.mockResolvedValue(null);

      await expect(service.getOrderById(999)).rejects.toBeInstanceOf(
        RpcException,
      );
    });

    it('should propagate database errors', async () => {
      prismaMock.order.findUnique.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.getOrderById(1)).rejects.toThrow('Database error');
    });
  });

  describe('addOrder', () => {
    const dto = {
      items: [{ productId: 10, quantity: 2 }],
    };

    it('should validate products and create an order', async () => {
      catalogServiceMock.GetProduct.mockReturnValue(
        of({ id: 10, name: 'Keyboard', price: 100 }),
      );
      prismaMock.order.create.mockResolvedValue(order);

      const result = await service.addOrder(dto);

      expect(catalogServiceMock.GetProduct).toHaveBeenCalledWith({ id: 10 });
      expect(prismaMock.order.create).toHaveBeenCalledWith({
        data: {
          items: {
            create: dto.items,
          },
        },
        include: { items: true },
      });
      expect(result).toEqual(order);
    });

    it.each([
      ['missing items', undefined],
      ['empty items', []],
    ])('should reject %s', async (_label, items) => {
      await expect(
        service.addOrder({ items } as any),
      ).rejects.toBeInstanceOf(RpcException);

      expect(prismaMock.order.create).not.toHaveBeenCalled();
    });

    it.each([0, -1, 1.5, Number.NaN])(
      'should reject invalid quantity: %s',
      async (quantity) => {
        await expect(
          service.addOrder({
            items: [{ productId: 10, quantity }],
          }),
        ).rejects.toBeInstanceOf(RpcException);

        expect(prismaMock.order.create).not.toHaveBeenCalled();
      },
    );

    it('should reject a non-positive product ID', async () => {
      await expect(
        service.addOrder({
          items: [{ productId: 0, quantity: 1 }],
        }),
      ).rejects.toBeInstanceOf(RpcException);

      expect(catalogServiceMock.GetProduct).not.toHaveBeenCalled();
      expect(prismaMock.order.create).not.toHaveBeenCalled();
    });

    it('should not create an order when the catalog request fails', async () => {
      catalogServiceMock.GetProduct.mockReturnValue(
        throwError(() => new Error('Catalog unavailable')),
      );

      await expect(service.addOrder(dto)).rejects.toThrow(
        'Catalog unavailable',
      );

      expect(prismaMock.order.create).not.toHaveBeenCalled();
    });

    it('should translate a missing catalog product into RpcException', async () => {
      catalogServiceMock.GetProduct.mockReturnValue(
        throwError(() => ({
          details: JSON.stringify({
            code: 'CAT-001',
            message: 'Product not found',
            statusCode: 404,
          }),
        })),
      );

      await expect(service.addOrder(dto)).rejects.toBeInstanceOf(RpcException);

      expect(prismaMock.order.create).not.toHaveBeenCalled();
    });

    it('should propagate database errors when creating an order', async () => {
      catalogServiceMock.GetProduct.mockReturnValue(
        of({ id: 10, name: 'Keyboard', price: 100 }),
      );
      prismaMock.order.create.mockRejectedValue(
        new Error('Database error'),
      );

      await expect(service.addOrder(dto)).rejects.toThrow('Database error');
    });
  });
});
