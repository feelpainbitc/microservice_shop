import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';

const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:3000';

describe('Shop API — Happy Path (E2E)', () => {
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const user = {
    name: 'E2E Test User',
    email: `e2e-${suffix}@example.com`,
    password: 'E2eTestPassword123!',
  };

  let token: string;
  let productId: number;
  let orderId: number;

  const api = request(BASE_URL);

  beforeAll(async () => {
    // Проверяем, что Gateway доступен.
    const response = await api.get('/products');
    expect([200, 201]).toContain(response.status);
    console.log('LOGIN RESPONSE:', response.status, response.body);
  });

  it('1. registers a user', async () => {
    const response = await api.post('/auth/register').send(user);

    expect([200, 201]).toContain(response.status);
    expect(response.body).toBeDefined();
  });

  it('2. logs in and receives a JWT', async () => {
    const response = await api.post('/auth/login').send({
      email: user.email,
      password: user.password,
    });

    expect([200, 201]).toContain(response.status);
    console.log('LOGIN RESPONSE:', response.status, response.body);
    expect(response.body).toBeDefined();

    // Поддерживаем распространённые варианты формата ответа.
    token =
      response.body.access_token ??
      response.body.accessToken ??
      response.body.token;

    expect(token).toEqual(expect.any(String));
    expect(token.length).toBeGreaterThan(0);
  });

  it('3. creates a product', async () => {
    const response = await api.post('/products').send({
      name: `E2E Product ${suffix}`,
      description: 'Product created by Happy Path E2E test',
      price: 49.99,
    });

    expect([200, 201]).toContain(response.status);
    expect(response.body).toBeDefined();

    productId = Number(response.body.id);
    expect(Number.isInteger(productId)).toBe(true);
    expect(productId).toBeGreaterThan(0);
  });

  it('4. reads the created product', async () => {
    const response = await api.get(`/products/${productId}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe(productId);
    expect(response.body.name).toBe(`E2E Product ${suffix}`);
  });

  it('5. creates an order for the product', async () => {
    const response = await api.post('/orders').send({
      items: [{ productId, quantity: 2 }],
    });

    expect([200, 201]).toContain(response.status);
    expect(response.body.order).toBeDefined();

    orderId = Number(response.body.order.id);

    expect(Number.isInteger(orderId)).toBe(true);
    expect(orderId).toBeGreaterThan(0);
    expect(response.body.order.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId,
          quantity: 2,
        }),
      ]),
    );
  });

  it('6. reads the created order and verifies its items', async () => {
    const response = await api.get(`/orders/${orderId}`);
    console.log('GET ORDER STATUS:', response.status);
    console.log('GET ORDER BODY:', JSON.stringify(response.body, null, 2));

    expect([200, 201]).toContain(response.status);
    expect(response.body.order).toBeDefined();
    const orderStatus = response.body.order.status;
    orderId = Number(response.body.order.id);
    console.log(`ORDER ID: ${orderId}`);
    console.log('ORDER STATUS', orderStatus);

    expect(Number.isInteger(orderId)).toBe(true);
    expect(response.body.order.status).toBe('CREATED');
    expect(response.body.order.items).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          productId,
          quantity: 2,
        }),
      ]),
    );
  });
});
