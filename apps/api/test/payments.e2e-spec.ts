import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { PrismaService } from '../src/prisma/prisma.service';
import {
  createTestApp,
  closeTestApp,
  cleanDatabase,
  createAuthenticatedUser,
  createTestClient,
} from './helpers/test-utils';
import { v4 as uuidv4 } from 'uuid';

describe('Payment Processing (E2E)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    app = await createTestApp();
    prisma = app.get(PrismaService);
  });

  afterAll(async () => {
    await closeTestApp(app);
  });

  beforeEach(async () => {
    await cleanDatabase(prisma);
  });

  describe('Idempotency for Client Payments', () => {
    it('should prevent duplicate payment with same idempotency key', async () => {
      const { token, tenantId } = await createAuthenticatedUser(app, { role: 'ACCOUNTING' });
      const client = await createTestClient(prisma, tenantId);

      const booking = await prisma.booking.create({
        data: {
          tenantId,
          clientId: client.id,
          bookingCode: 'BK-TEST-001',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-07'),
          lockedExchangeRate: 30.0,
          totalCostTry: 30000,
          totalSellEur: 1200,
          depositDueEur: 360,
          balanceDueEur: 840,
          status: 'CONFIRMED',
        },
      });

      const idempotencyKey = uuidv4();

      // First payment request
      const firstResponse = await request(app.getHttpServer())
        .post('/api/v1/payment-client')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          bookingId: booking.id,
          amountEur: 360,
          method: 'CREDIT_CARD',
          paidAt: new Date().toISOString(),
          status: 'COMPLETED',
        })
        .expect(201);

      expect(firstResponse.body.amountEur).toBe('360');

      // Second payment request with SAME idempotency key
      const secondResponse = await request(app.getHttpServer())
        .post('/api/v1/payment-client')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', idempotencyKey)
        .send({
          bookingId: booking.id,
          amountEur: 360,
          method: 'CREDIT_CARD',
          paidAt: new Date().toISOString(),
          status: 'COMPLETED',
        })
        .expect(201);

      // Should return cached response (compare key fields, allowing for serialization differences)
      expect(secondResponse.body.id).toBe(firstResponse.body.id);
      expect(parseFloat(secondResponse.body.amountEur)).toBe(parseFloat(firstResponse.body.amountEur));
      expect(secondResponse.body.method).toBe(firstResponse.body.method);
      expect(secondResponse.body.status).toBe(firstResponse.body.status);

      // Verify only ONE payment was created in database
      const payments = await prisma.paymentClient.findMany({
        where: { bookingId: booking.id },
      });

      expect(payments).toHaveLength(1);
      expect(payments[0].amountEur.toString()).toBe('360');
    });

    it('should allow different payments with different idempotency keys', async () => {
      const { token, tenantId } = await createAuthenticatedUser(app, { role: 'ACCOUNTING' });
      const client = await createTestClient(prisma, tenantId);

      const booking = await prisma.booking.create({
        data: {
          tenantId,
          clientId: client.id,
          bookingCode: 'BK-TEST-002',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-07'),
          lockedExchangeRate: 30.0,
          totalCostTry: 30000,
          totalSellEur: 1200,
          depositDueEur: 360,
          balanceDueEur: 840,
          status: 'CONFIRMED',
        },
      });

      // First payment with key 1
      await request(app.getHttpServer())
        .post('/api/v1/payment-client')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', uuidv4())
        .send({
          bookingId: booking.id,
          amountEur: 360, // Deposit
          method: 'BANK_TRANSFER',
          paidAt: new Date().toISOString(),
          status: 'COMPLETED',
        })
        .expect(201);

      // Second payment with key 2 (different payment)
      await request(app.getHttpServer())
        .post('/api/v1/payment-client')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', uuidv4())
        .send({
          bookingId: booking.id,
          amountEur: 840, // Balance
          method: 'BANK_TRANSFER',
          paidAt: new Date().toISOString(),
          status: 'COMPLETED',
        })
        .expect(201);

      // Should have TWO payments in database
      const payments = await prisma.paymentClient.findMany({
        where: { bookingId: booking.id },
      });

      expect(payments).toHaveLength(2);
      expect(payments.map(p => p.amountEur.toString()).sort()).toEqual(['360', '840']);
    });

    it('should require idempotency key for payment endpoints', async () => {
      const { token, tenantId } = await createAuthenticatedUser(app, { role: 'ACCOUNTING' });
      const client = await createTestClient(prisma, tenantId);

      const booking = await prisma.booking.create({
        data: {
          tenantId,
          clientId: client.id,
          bookingCode: 'BK-TEST-003',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-07'),
          lockedExchangeRate: 30.0,
          totalCostTry: 30000,
          totalSellEur: 1200,
          depositDueEur: 360,
          balanceDueEur: 840,
          status: 'CONFIRMED',
        },
      });

      // Request WITHOUT idempotency key
      const response = await request(app.getHttpServer())
        .post('/api/v1/payment-client')
        .set('Authorization', `Bearer ${token}`)
        // NO Idempotency-Key header
        .send({
          bookingId: booking.id,
          amountEur: 360,
          method: 'CREDIT_CARD',
          paidAt: new Date().toISOString(),
          status: 'COMPLETED',
        })
        .expect(409);

      expect(response.body.message).toContain('idempotency-key');
    });
  });

  describe('Client Payment Validation', () => {
    it('should create client payment successfully', async () => {
      const { token, tenantId } = await createAuthenticatedUser(app, { role: 'ACCOUNTING' });
      const client = await createTestClient(prisma, tenantId);

      const booking = await prisma.booking.create({
        data: {
          tenantId,
          clientId: client.id,
          bookingCode: 'BK-TEST-004',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-07'),
          lockedExchangeRate: 30.0,
          totalCostTry: 30000,
          totalSellEur: 1200,
          depositDueEur: 360,
          balanceDueEur: 840,
          status: 'CONFIRMED',
        },
      });

      const response = await request(app.getHttpServer())
        .post('/api/v1/payment-client')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', uuidv4())
        .send({
          bookingId: booking.id,
          amountEur: 360,
          method: 'CREDIT_CARD',
          paidAt: new Date().toISOString(),
          txnRef: 'TXN-12345',
          status: 'COMPLETED',
          notes: 'Deposit payment',
        })
        .expect(201);

      expect(response.body).toMatchObject({
        amountEur: '360',
        method: 'CREDIT_CARD',
        status: 'COMPLETED',
        txnRef: 'TXN-12345',
      });
      expect(response.body.booking.bookingCode).toBe('BK-TEST-004');
    });

    it('should reject payment for non-existent booking', async () => {
      const { token } = await createAuthenticatedUser(app, { role: 'ACCOUNTING' });

      const response = await request(app.getHttpServer())
        .post('/api/v1/payment-client')
        .set('Authorization', `Bearer ${token}`)
        .set('Idempotency-Key', uuidv4())
        .send({
          bookingId: 99999, // Non-existent
          amountEur: 360,
          method: 'CREDIT_CARD',
          paidAt: new Date().toISOString(),
          status: 'COMPLETED',
        })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should reject payment for another tenant\'s booking', async () => {
      const tenant1 = await createAuthenticatedUser(app, { role: 'ACCOUNTING' });
      const tenant2 = await createAuthenticatedUser(app, { role: 'ACCOUNTING' });

      const client2 = await createTestClient(prisma, tenant2.tenantId);

      const booking2 = await prisma.booking.create({
        data: {
          tenantId: tenant2.tenantId,
          clientId: client2.id,
          bookingCode: 'BK-T2-001',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-07'),
          lockedExchangeRate: 30.0,
          totalCostTry: 30000,
          totalSellEur: 1200,
          depositDueEur: 360,
          balanceDueEur: 840,
          status: 'CONFIRMED',
        },
      });

      // Tenant 1 tries to create payment for tenant 2's booking
      const response = await request(app.getHttpServer())
        .post('/api/v1/payment-client')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .set('Idempotency-Key', uuidv4())
        .send({
          bookingId: booking2.id,
          amountEur: 360,
          method: 'CREDIT_CARD',
          paidAt: new Date().toISOString(),
          status: 'COMPLETED',
        })
        .expect(404);

      expect(response.body.message).toContain('not found');
    });
  });

  describe('Payment Statistics', () => {
    it('should calculate payment stats correctly', async () => {
      const { token, tenantId } = await createAuthenticatedUser(app, { role: 'ACCOUNTING' });
      const client = await createTestClient(prisma, tenantId);

      const booking = await prisma.booking.create({
        data: {
          tenantId,
          clientId: client.id,
          bookingCode: 'BK-STATS-001',
          startDate: new Date('2024-06-01'),
          endDate: new Date('2024-06-07'),
          lockedExchangeRate: 30.0,
          totalCostTry: 30000,
          totalSellEur: 1200,
          depositDueEur: 360,
          balanceDueEur: 840,
          status: 'CONFIRMED',
        },
      });

      // Create multiple payments
      await prisma.paymentClient.createMany({
        data: [
          {
            tenantId,
            bookingId: booking.id,
            amountEur: 200,
            method: 'CREDIT_CARD',
            status: 'COMPLETED',
            paidAt: new Date(),
          },
          {
            tenantId,
            bookingId: booking.id,
            amountEur: 300,
            method: 'BANK_TRANSFER',
            status: 'COMPLETED',
            paidAt: new Date(),
          },
          {
            tenantId,
            bookingId: booking.id,
            amountEur: 150,
            method: 'CREDIT_CARD',
            status: 'PENDING',
            paidAt: new Date(),
          },
        ],
      });

      const response = await request(app.getHttpServer())
        .get('/api/v1/payment-client/stats')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      // Should have stats grouped by method and status
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body.length).toBeGreaterThan(0);

      // Find credit card completed stats
      const creditCardCompleted = response.body.find(
        (s: any) => s.method === 'CREDIT_CARD' && s.status === 'COMPLETED'
      );
      expect(creditCardCompleted).toBeDefined();
      expect(parseFloat(creditCardCompleted._sum.amountEur)).toBe(200);
    });
  });
});
