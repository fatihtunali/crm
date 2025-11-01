import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from '../../src/app.module';
import { PrismaService } from '../../src/prisma/prisma.service';
import request from 'supertest';

/**
 * Create test application instance
 */
export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleFixture.createNestApplication();

  // Apply same configuration as main.ts
  app.setGlobalPrefix('api/v1');

  await app.init();
  return app;
}

/**
 * Clean up test application
 */
export async function closeTestApp(app: INestApplication): Promise<void> {
  const prisma = app.get(PrismaService);
  await prisma.$disconnect();
  await app.close();
}

/**
 * Create test user and get auth token
 */
export async function createAuthenticatedUser(
  app: INestApplication,
  userData?: Partial<{
    email: string;
    password: string;
    name: string;
    role: string;
  }>,
): Promise<{ token: string; user: any; tenantId: number }> {
  const prisma = app.get(PrismaService);

  // Create tenant first
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Test Agency',
      code: `TEST-${Date.now()}`,
      email: 'test@agency.com',
      isActive: true,
    },
  });

  // Hash password
  const argon2 = require('argon2');
  const passwordHash = await argon2.hash(userData?.password || 'Test123!');

  // Create user
  const user = await prisma.user.create({
    data: {
      tenantId: tenant.id,
      email: userData?.email || `test-${Date.now()}@test.com`,
      passwordHash,
      name: userData?.name || 'Test User',
      role: (userData?.role as any) || 'ADMIN',
      isActive: true,
    },
  });

  // Login to get token
  const response = await request(app.getHttpServer())
    .post('/api/v1/auth/login')
    .send({
      email: user.email,
      password: userData?.password || 'Test123!',
    });

  return {
    token: response.body.accessToken,
    user: response.body.user,
    tenantId: tenant.id,
  };
}

/**
 * Create test client
 */
export async function createTestClient(
  prisma: PrismaService,
  tenantId: number,
  data?: Partial<any>,
) {
  return prisma.client.create({
    data: {
      tenantId,
      name: data?.name || 'Test Client',
      email: data?.email || `client-${Date.now()}@test.com`,
      phone: data?.phone || '+90 555 123 4567',
      nationality: data?.nationality || 'Turkish',
      isActive: true,
      ...data,
    },
  });
}

/**
 * Create test exchange rate
 */
export async function createTestExchangeRate(
  prisma: PrismaService,
  tenantId: number,
  rate: number = 30.0,
  date?: Date,
) {
  return prisma.exchangeRate.create({
    data: {
      tenantId,
      fromCurrency: 'TRY',
      toCurrency: 'EUR',
      rate,
      rateDate: date || new Date(),
      source: 'manual',
    },
  });
}

/**
 * Create test lead
 */
export async function createTestLead(
  prisma: PrismaService,
  tenantId: number,
  clientId: number,
  data?: Partial<any>,
) {
  return prisma.lead.create({
    data: {
      tenantId,
      clientId,
      source: data?.source || 'website',
      inquiryDate: data?.inquiryDate || new Date(),
      destination: data?.destination || 'Istanbul',
      paxAdults: data?.paxAdults || 2,
      paxChildren: data?.paxChildren || 0,
      budgetEur: data?.budgetEur || 1000,
      status: data?.status || 'NEW',
      ...data,
    },
  });
}

/**
 * Create test quotation
 */
export async function createTestQuotation(
  prisma: PrismaService,
  tenantId: number,
  leadId: number,
  data?: Partial<any>,
) {
  return prisma.quotation.create({
    data: {
      tenantId,
      leadId,
      calcCostTry: data?.calcCostTry || 30000,
      sellPriceEur: data?.sellPriceEur || 1250,
      exchangeRateUsed: data?.exchangeRateUsed || 30.0,
      status: data?.status || 'DRAFT',
      validUntil: data?.validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ...data,
    },
  });
}

/**
 * Clean database between tests
 */
export async function cleanDatabase(prisma: PrismaService): Promise<void> {
  // Delete in reverse order of dependencies
  await prisma.paymentClient.deleteMany();
  await prisma.paymentVendor.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.bookingItem.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.quotation.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.client.deleteMany();
  await prisma.exchangeRate.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();
}
