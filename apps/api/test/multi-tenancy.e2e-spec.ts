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

describe('Multi-Tenancy Isolation (E2E)', () => {
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

  describe('Tenant Data Isolation', () => {
    it('should prevent accessing another tenant\'s clients', async () => {
      // Create two separate tenants with users
      const tenant1 = await createAuthenticatedUser(app, {
        email: 'user1@tenant1.com',
        password: 'Pass123!',
      });

      const tenant2 = await createAuthenticatedUser(app, {
        email: 'user2@tenant2.com',
        password: 'Pass123!',
      });

      // Create client for tenant 1
      const client1 = await createTestClient(prisma, tenant1.tenantId, {
        name: 'Tenant 1 Client',
        email: 'client1@tenant1.com',
      });

      // Create client for tenant 2
      const client2 = await createTestClient(prisma, tenant2.tenantId, {
        name: 'Tenant 2 Client',
        email: 'client2@tenant2.com',
      });

      // Tenant 1 should only see their client
      const tenant1Response = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .expect(200);

      expect(tenant1Response.body.data).toHaveLength(1);
      expect(tenant1Response.body.data[0].id).toBe(client1.id);
      expect(tenant1Response.body.data[0].name).toBe('Tenant 1 Client');

      // Tenant 2 should only see their client
      const tenant2Response = await request(app.getHttpServer())
        .get('/api/v1/clients')
        .set('Authorization', `Bearer ${tenant2.token}`)
        .expect(200);

      expect(tenant2Response.body.data).toHaveLength(1);
      expect(tenant2Response.body.data[0].id).toBe(client2.id);
      expect(tenant2Response.body.data[0].name).toBe('Tenant 2 Client');
    });

    it('should prevent tenant 1 from accessing tenant 2 client by ID', async () => {
      const tenant1 = await createAuthenticatedUser(app, {
        email: 'user1@tenant1.com',
      });

      const tenant2 = await createAuthenticatedUser(app, {
        email: 'user2@tenant2.com',
      });

      // Create client for tenant 2
      const client2 = await createTestClient(prisma, tenant2.tenantId);

      // Tenant 1 tries to access tenant 2's client
      const response = await request(app.getHttpServer())
        .get(`/api/v1/clients/${client2.id}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .expect(404);

      expect(response.body.message).toContain('not found');
    });

    it('should prevent tenant from updating another tenant\'s client', async () => {
      const tenant1 = await createAuthenticatedUser(app);
      const tenant2 = await createAuthenticatedUser(app);

      const client2 = await createTestClient(prisma, tenant2.tenantId, {
        name: 'Original Name',
      });

      // Tenant 1 tries to update tenant 2's client
      const response = await request(app.getHttpServer())
        .patch(`/api/v1/clients/${client2.id}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .send({ name: 'Hacked Name' })
        .expect(404);

      // Verify client name wasn't changed
      const unchangedClient = await prisma.client.findUnique({
        where: { id: client2.id },
      });
      expect(unchangedClient).not.toBeNull();
      if (unchangedClient) {
        expect(unchangedClient.name).toBe('Original Name');
      }
    });

    it('should prevent tenant from deleting another tenant\'s client', async () => {
      const tenant1 = await createAuthenticatedUser(app);
      const tenant2 = await createAuthenticatedUser(app);

      const client2 = await createTestClient(prisma, tenant2.tenantId);

      // Tenant 1 tries to delete tenant 2's client
      await request(app.getHttpServer())
        .delete(`/api/v1/clients/${client2.id}`)
        .set('Authorization', `Bearer ${tenant1.token}`)
        .expect(404);

      // Verify client still exists
      const stillExists = await prisma.client.findUnique({
        where: { id: client2.id },
      });
      expect(stillExists).not.toBeNull();
    });
  });

  describe('Tenant Isolation for Related Entities', () => {
    it('should isolate bookings across tenants', async () => {
      const tenant1 = await createAuthenticatedUser(app);
      const tenant2 = await createAuthenticatedUser(app);

      const client1 = await createTestClient(prisma, tenant1.tenantId);
      const client2 = await createTestClient(prisma, tenant2.tenantId);

      // Create booking for each tenant
      await prisma.booking.create({
        data: {
          tenantId: tenant1.tenantId,
          clientId: client1.id,
          bookingCode: 'BK-T1-001',
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

      await prisma.booking.create({
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

      // Each tenant should only see their own booking
      const tenant1Bookings = await request(app.getHttpServer())
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .expect(200);

      expect(tenant1Bookings.body.data).toHaveLength(1);
      expect(tenant1Bookings.body.data[0].bookingCode).toBe('BK-T1-001');

      const tenant2Bookings = await request(app.getHttpServer())
        .get('/api/v1/bookings')
        .set('Authorization', `Bearer ${tenant2.token}`)
        .expect(200);

      expect(tenant2Bookings.body.data).toHaveLength(1);
      expect(tenant2Bookings.body.data[0].bookingCode).toBe('BK-T2-001');
    });

    it('should isolate exchange rates across tenants', async () => {
      const tenant1 = await createAuthenticatedUser(app);
      const tenant2 = await createAuthenticatedUser(app);

      // Create exchange rates for each tenant
      await prisma.exchangeRate.create({
        data: {
          tenantId: tenant1.tenantId,
          fromCurrency: 'TRY',
          toCurrency: 'EUR',
          rate: 28.0,
          rateDate: new Date(),
          source: 'manual',
        },
      });

      await prisma.exchangeRate.create({
        data: {
          tenantId: tenant2.tenantId,
          fromCurrency: 'TRY',
          toCurrency: 'EUR',
          rate: 32.0,
          rateDate: new Date(),
          source: 'manual',
        },
      });

      // Each tenant should only see their own rate
      const tenant1Rates = await request(app.getHttpServer())
        .get('/api/v1/exchange-rates')
        .set('Authorization', `Bearer ${tenant1.token}`)
        .expect(200);

      expect(tenant1Rates.body.data).toHaveLength(1);
      expect(parseFloat(tenant1Rates.body.data[0].rate)).toBe(28.0);

      const tenant2Rates = await request(app.getHttpServer())
        .get('/api/v1/exchange-rates')
        .set('Authorization', `Bearer ${tenant2.token}`)
        .expect(200);

      expect(tenant2Rates.body.data).toHaveLength(1);
      expect(parseFloat(tenant2Rates.body.data[0].rate)).toBe(32.0);
    });
  });

  describe('JWT Token Tenant Validation', () => {
    it('should embed tenantId in JWT token', async () => {
      const { token, tenantId } = await createAuthenticatedUser(app);

      // Decode JWT (not verifying signature, just reading payload)
      const { jwtDecode } = require('jwt-decode');
      const decoded = jwtDecode(token);

      expect(decoded.tenantId).toBe(tenantId);
      expect(decoded).toHaveProperty('sub'); // user ID
      expect(decoded).toHaveProperty('email');
      expect(decoded).toHaveProperty('role');
    });

    it('should use tenantId from JWT, not request body', async () => {
      const { token, tenantId } = await createAuthenticatedUser(app);
      const otherTenant = await createAuthenticatedUser(app);

      // Try to create client with different tenantId in body (should be ignored)
      const response = await request(app.getHttpServer())
        .post('/api/v1/clients')
        .set('Authorization', `Bearer ${token}`)
        .send({
          tenantId: otherTenant.tenantId, // Trying to create for other tenant
          name: 'Test Client',
          email: 'test@test.com',
        })
        .expect(201);

      // Should create for the authenticated user's tenant, not the one in body
      expect(response.body.tenantId).toBe(tenantId);
      expect(response.body.tenantId).not.toBe(otherTenant.tenantId);
    });
  });

  describe('Tenant Cascade Deletion', () => {
    it('should cascade delete all tenant data when tenant is deleted', async () => {
      const { tenantId } = await createAuthenticatedUser(app);

      // Create various entities for the tenant
      const client = await createTestClient(prisma, tenantId);
      await prisma.exchangeRate.create({
        data: {
          tenantId,
          fromCurrency: 'TRY',
          toCurrency: 'EUR',
          rate: 30.0,
          rateDate: new Date(),
          source: 'manual',
        },
      });

      // Verify data exists
      expect(await prisma.client.count({ where: { tenantId } })).toBe(1);
      expect(await prisma.user.count({ where: { tenantId } })).toBe(1);
      expect(await prisma.exchangeRate.count({ where: { tenantId } })).toBe(1);

      // Delete tenant
      await prisma.tenant.delete({ where: { id: tenantId } });

      // All related data should be cascade deleted
      expect(await prisma.client.count({ where: { tenantId } })).toBe(0);
      expect(await prisma.user.count({ where: { tenantId } })).toBe(0);
      expect(await prisma.exchangeRate.count({ where: { tenantId } })).toBe(0);
    });
  });
});
