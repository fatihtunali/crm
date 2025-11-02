import { PaymentStatus, QuotationStatus, BookingStatus } from '@tour-crm/shared';

/**
 * Test Helper Utilities
 *
 * Provides mock factories and utilities for unit testing
 */

export const createMockPrismaService = () => ({
  client: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  booking: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  bookingItem: {
    createMany: jest.fn(),
    findMany: jest.fn(),
  },
  paymentClient: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  paymentVendor: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    aggregate: jest.fn(),
    groupBy: jest.fn(),
  },
  quotation: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  exchangeRate: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
  },
  consent: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
  },
  privacyPolicyAcceptance: {
    findFirst: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
  },
  auditLog: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
  user: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  passwordResetToken: {
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deleteMany: jest.fn(),
  },
  $transaction: jest.fn(),
});

export const createMockUser = (overrides: Partial<any> = {}) => ({
  id: 1,
  email: 'test@example.com',
  password: '$argon2id$v=19$m=65536,t=3,p=4$hash',
  firstName: 'Test',
  lastName: 'User',
  tenantId: 1,
  role: 'AGENT',
  isActive: true,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockClient = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1234567890',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockBooking = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  bookingCode: 'BK-2024-0001',
  clientId: 1,
  status: BookingStatus.CONFIRMED,
  startDate: new Date('2024-06-15'),
  endDate: new Date('2024-06-20'),
  totalCostTry: 10000,
  totalSellEur: 500,
  depositDueEur: 150,
  balanceDueEur: 350,
  lockedExchangeRate: 0.05,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockPaymentClient = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  bookingId: 1,
  amountEur: 150,
  method: 'BANK_TRANSFER',
  status: PaymentStatus.COMPLETED,
  paidAt: new Date('2024-01-15'),
  txnRef: 'TXN-001',
  notes: null,
  createdAt: new Date('2024-01-15'),
  updatedAt: new Date('2024-01-15'),
  ...overrides,
});

export const createMockPaymentVendor = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  bookingItemId: 1,
  supplierId: 5,
  amountTry: 3000,
  method: 'BANK_TRANSFER',
  status: PaymentStatus.COMPLETED,
  paidAt: new Date('2024-01-20'),
  txnRef: 'VENDOR-TXN-001',
  notes: null,
  createdAt: new Date('2024-01-20'),
  updatedAt: new Date('2024-01-20'),
  ...overrides,
});

export const createMockQuotation = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  leadId: 1,
  tourId: 5,
  status: QuotationStatus.DRAFT,
  calcCostTry: 10000,
  sellPriceEur: 500,
  exchangeRateUsed: 0.05,
  validUntil: new Date('2024-12-31'),
  customJson: { items: [] },
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockExchangeRate = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  fromCurrency: 'TRY',
  toCurrency: 'EUR',
  rate: 0.05,
  rateDate: new Date('2024-06-01'),
  source: 'MANUAL',
  createdAt: new Date('2024-06-01'),
  updatedAt: new Date('2024-06-01'),
  ...overrides,
});

export const createMockConsent = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  clientId: 1,
  consentType: 'MARKETING',
  granted: true,
  grantedAt: new Date('2024-01-01'),
  revokedAt: null,
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  version: 1,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockPrivacyPolicyAcceptance = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  userId: 1,
  policyVersion: '1.0',
  acceptedAt: new Date('2024-01-01'),
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  ...overrides,
});

export const createMockAuditLog = (overrides: Partial<any> = {}) => ({
  id: 1,
  tenantId: 1,
  userId: 1,
  action: 'CREATE',
  entity: 'Booking',
  entityId: 1,
  changes: {},
  ipAddress: '192.168.1.1',
  userAgent: 'Mozilla/5.0',
  createdAt: new Date('2024-01-01'),
  ...overrides,
});

export const createMockCacheManager = () => ({
  get: jest.fn(),
  set: jest.fn(),
  del: jest.fn(),
  reset: jest.fn(),
  wrap: jest.fn(),
  store: {
    keys: jest.fn(),
    del: jest.fn(),
  },
});

export const createMockEncryptionService = () => ({
  encrypt: jest.fn((value: string) => `encrypted:${value}`),
  decrypt: jest.fn((value: string) => value.replace('encrypted:', '')),
  isEncrypted: jest.fn((value: string) => value.startsWith('encrypted:')),
  hash: jest.fn((value: string) => `hashed:${value}`),
  compareHash: jest.fn((value: string, hash: string) => `hashed:${value}` === hash),
});

export const createMockJwtService = () => ({
  sign: jest.fn((payload: any) => `jwt.token.${payload.sub}`),
  verify: jest.fn((token: string) => ({ sub: 1, email: 'test@example.com' })),
  decode: jest.fn((token: string) => ({ sub: 1, email: 'test@example.com' })),
});

export const createMockConfigService = () => ({
  get: jest.fn((key: string) => {
    const config: Record<string, any> = {
      JWT_SECRET: 'test-secret',
      JWT_EXPIRES_IN: '1h',
      ENCRYPTION_KEY: 'test-encryption-key-32-characters',
      DATABASE_URL: 'postgresql://test',
      REDIS_URL: 'redis://localhost:6379',
    };
    return config[key];
  }),
  getOrThrow: jest.fn((key: string) => {
    const config: Record<string, any> = {
      JWT_SECRET: 'test-secret',
      ENCRYPTION_KEY: 'test-encryption-key-32-characters',
    };
    const value = config[key];
    if (!value) throw new Error(`Config ${key} not found`);
    return value;
  }),
});

/**
 * Helper to create a mock Express request object
 */
export const createMockRequest = (overrides: Partial<any> = {}) => ({
  ip: '192.168.1.1',
  get: jest.fn((header: string) => {
    if (header === 'user-agent') return 'Mozilla/5.0 Test Browser';
    return null;
  }),
  headers: {
    'user-agent': 'Mozilla/5.0 Test Browser',
  },
  user: createMockUser(),
  ...overrides,
});

/**
 * Helper to wait for async operations
 */
export const wait = (ms: number = 100) =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Helper to create date ranges for testing
 */
export const createDateRange = (daysFromNow: number = 30) => {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + daysFromNow);
  return { startDate: start, endDate: end };
};
