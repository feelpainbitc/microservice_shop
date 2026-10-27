import { beforeEach, describe, expect, it, vi } from 'vitest';
import { OrdersController } from './orders.controller.js';

describe('OrdersController', () => {
  const orders = [
    {
      id: 1,
      status: 'CREATED',
      items: [{ productId: 10, quantity: 2 }],
    },
  ];

  const order = orders[0];

  const ordersService = {
    getAllOrders: vi.fn(),
    getOrderById: vi.fn(),
    addOrder: vi.fn(),
  };

  const client = {
    getService: vi.fn(),
  };

  let controller: OrdersController;

  beforeEach(() => {
    vi.clearAllMocks();

    ordersService.getAllOrders.mockReturnValue(orders);
    ordersService.getOrderById.mockReturnValue(order);
    ordersService.addOrder.mockReturnValue(order);

    client.getService.mockReturnValue(ordersService);

    controller = new OrdersController(client as never);
    controller.onModuleInit();
  });

  it('should initialize OrdersService from gRPC client', () => {
    expect(client.getService).toHaveBeenCalledWith('OrdersService');
  });

  describe('getAll', () => {
    it('should return all orders', () => {
      expect(controller.getAll()).toEqual(orders);
      expect(ordersService.getAllOrders).toHaveBeenCalledWith({});
    });
  });

  describe('getById', () => {
    it('should convert the order ID to a number', () => {
      expect(controller.getById('1')).toEqual(order);
      expect(ordersService.getOrderById).toHaveBeenCalledWith({
        id: 1,
      });
    });
  });

  describe('addOrder', () => {
    it('should pass order data to the orders service', () => {
      const dto = {
        items: [
          { productId: 10, quantity: 2 },
          { productId: 20, quantity: 1 },
        ],
      };

      expect(controller.addOrder(dto)).toEqual(order);
      expect(ordersService.addOrder).toHaveBeenCalledWith(dto);
      expect(ordersService.addOrder).toHaveBeenCalledTimes(1);
    });
  });
});
