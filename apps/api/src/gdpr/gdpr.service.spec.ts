import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { GdprService } from './gdpr.service';
import { PrismaService } from '../prisma/prisma.service';

describe('GdprService', () => {
  let service: GdprService;
  let prisma: any;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    client: {
      findFirst: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GdprService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<GdprService>(GdprService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('anonymizeClient', () => {
    const mockClient = {
      id: 1,
      tenantId: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      passportNumber: 'AB123456',
      dateOfBirth: new Date('1990-01-01'),
      nationality: 'US',
      notes: 'Regular customer',
      tags: ['VIP'],
      isActive: true,
      bookings: [],
    };

    it('should anonymize client data', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);

      const anonymized = {
        id: 1,
        name: 'Deleted User 1',
        email: 'deleted-1-1234567890@anonymized.local',
        phone: null,
        passportNumber: null,
        dateOfBirth: null,
        nationality: null,
        notes: '[Personal data deleted per GDPR request]',
        tags: ['ANONYMIZED'],
        isActive: false,
      };

      prisma.client.update.mockResolvedValue(anonymized);
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.anonymizeClient(1, 1, 10);

      expect(result.success).toBe(true);
      expect(result.message).toContain('anonymized successfully');
      expect(prisma.client.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: expect.objectContaining({
          name: expect.stringContaining('Deleted User'),
          email: expect.stringContaining('deleted-'),
          phone: null,
          passportNumber: null,
          dateOfBirth: null,
          nationality: null,
          tags: ['ANONYMIZED'],
          isActive: false,
        }),
      });
    });

    it('should preserve booking history', async () => {
      const clientWithBookings = {
        ...mockClient,
        bookings: [
          { id: 1, bookingCode: 'BK-001', status: 'COMPLETED' },
          { id: 2, bookingCode: 'BK-002', status: 'COMPLETED' },
        ],
      };

      prisma.client.findFirst.mockResolvedValue(clientWithBookings);
      prisma.client.update.mockResolvedValue({ id: 1 });
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.anonymizeClient(1, 1, 10);

      expect(result.preservedRecords.bookings).toBe(2);
      expect(result.preservedRecords.reason).toContain('Legal and financial');
    });

    it('should check for active bookings', async () => {
      const clientWithActiveBookings = {
        ...mockClient,
        bookings: [
          { id: 1, bookingCode: 'BK-001', status: 'CONFIRMED' },
          { id: 2, bookingCode: 'BK-002', status: 'PENDING' },
        ],
      };

      prisma.client.findFirst.mockResolvedValue(clientWithActiveBookings);

      await expect(
        service.anonymizeClient(1, 1, 10),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.anonymizeClient(1, 1, 10),
      ).rejects.toThrow('Cannot anonymize client with 2 active booking');
    });

    it('should create audit log', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.client.update.mockResolvedValue({ id: 1 });

      await service.anonymizeClient(1, 1, 10);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          tenantId: 1,
          userId: 10,
          action: 'GDPR_DATA_DELETION',
          entityType: 'Client',
          entityId: 1,
          details: expect.objectContaining({
            originalEmail: 'john@example.com',
            originalName: 'John Doe',
            deletionDate: expect.any(String),
            reason: 'GDPR Right to be Forgotten request',
          }),
        },
      });
    });

    it('should throw error when client not found', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.anonymizeClient(999, 1, 10),
      ).rejects.toThrow(NotFoundException);
    });

    it('should allow anonymization with completed bookings', async () => {
      const clientWithCompletedBookings = {
        ...mockClient,
        bookings: [
          { id: 1, bookingCode: 'BK-001', status: 'COMPLETED' },
          { id: 2, bookingCode: 'BK-002', status: 'CANCELLED' },
        ],
      };

      prisma.client.findFirst.mockResolvedValue(clientWithCompletedBookings);
      prisma.client.update.mockResolvedValue({ id: 1 });
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.anonymizeClient(1, 1, 10);

      expect(result.success).toBe(true);
    });

    it('should respect tenant isolation', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await service.anonymizeClient(1, 2, 10).catch(() => {});

      expect(prisma.client.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 1,
            tenantId: 2,
          }),
        }),
      );
    });
  });

  describe('exportUserData', () => {
    const mockUser = {
      id: 1,
      tenantId: 1,
      email: 'user@example.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
      tenant: {
        id: 1,
        name: 'Test Tenant',
        code: 'TEST',
        defaultCurrency: 'EUR',
      },
      auditLogs: [],
    };

    const mockClient = {
      id: 10,
      email: 'user@example.com',
      name: 'Test User',
      leads: [{ id: 1, quotations: [] }],
      bookings: [
        {
          id: 1,
          items: [],
          paymentsClient: [{ id: 1 }],
          invoices: [],
        },
      ],
    };

    it('should export all user data', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await service.exportUserData(1, 1);

      expect(result.dataSubject.type).toBe('USER');
      expect(result.dataSubject.id).toBe(1);
      expect(result.format).toBe('JSON');
      expect(result.user).toBeDefined();
      expect(result.user.passwordHash).toBeUndefined();
    });

    it('should include related client data', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await service.exportUserData(1, 1);

      expect(result.client).toBeDefined();
      expect(result.metadata.totalLeads).toBe(1);
      expect(result.metadata.totalBookings).toBe(1);
      expect(result.metadata.totalPayments).toBe(1);
    });

    it('should format as JSON', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.client.findFirst.mockResolvedValue(null);

      const result = await service.exportUserData(1, 1);

      expect(result.format).toBe('JSON');
      expect(result.exportedAt).toBeDefined();
      expect(typeof result.exportedAt).toBe('string');
    });

    it('should throw error when user not found', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await expect(
        service.exportUserData(999, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should exclude password from export', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.client.findFirst.mockResolvedValue(null);

      const result = await service.exportUserData(1, 1);

      expect(result.user.passwordHash).toBeUndefined();
    });

    it('should handle user without client account', async () => {
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.client.findFirst.mockResolvedValue(null);

      const result = await service.exportUserData(1, 1);

      expect(result.client).toBeNull();
      expect(result.metadata.totalLeads).toBe(0);
      expect(result.metadata.totalBookings).toBe(0);
    });

    it('should respect tenant isolation', async () => {
      prisma.user.findFirst.mockResolvedValue(null);

      await service.exportUserData(1, 2).catch(() => {});

      expect(prisma.user.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            id: 1,
            tenantId: 2,
          }),
        }),
      );
    });
  });

  describe('exportClientData', () => {
    const mockClient = {
      id: 1,
      tenantId: 1,
      name: 'John Doe',
      email: 'john@example.com',
      phone: '+1234567890',
      nationality: 'US',
      passportNumber: 'AB123456',
      dateOfBirth: new Date('1990-01-01'),
      preferredLanguage: 'EN',
      tags: ['VIP'],
      notes: 'Regular customer',
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
      leads: [
        {
          id: 1,
          source: 'WEBSITE',
          status: 'CONVERTED',
          inquiryDate: new Date(),
          quotations: [{ id: 1 }],
        },
      ],
      bookings: [
        {
          id: 1,
          bookingCode: 'BK-001',
          startDate: new Date(),
          endDate: new Date(),
          status: 'COMPLETED',
          totalSellEur: 1000,
          items: [{ id: 1 }],
          paymentsClient: [{ id: 1 }],
          invoices: [{ id: 1 }],
          createdAt: new Date(),
        },
      ],
    };

    it('should export client data successfully', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.exportClientData(1, 1, 10);

      expect(result.dataSubject.type).toBe('CLIENT');
      expect(result.dataSubject.id).toBe(1);
      expect(result.personalData.name).toBe('John Doe');
      expect(result.personalData.email).toBe('john@example.com');
    });

    it('should include booking history', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.exportClientData(1, 1, 10);

      expect(result.bookingHistory).toHaveLength(1);
      expect(result.bookingHistory[0].bookingCode).toBe('BK-001');
      expect(result.metadata.totalBookings).toBe(1);
    });

    it('should include lead history', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.exportClientData(1, 1, 10);

      expect(result.leadHistory).toHaveLength(1);
      expect(result.metadata.totalLeads).toBe(1);
    });

    it('should create audit log for data export', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);

      await service.exportClientData(1, 1, 10);

      expect(prisma.auditLog.create).toHaveBeenCalledWith({
        data: {
          tenantId: 1,
          userId: 10,
          action: 'GDPR_DATA_EXPORT',
          entityType: 'Client',
          entityId: 1,
          details: expect.objectContaining({
            clientEmail: 'john@example.com',
            exportDate: expect.any(String),
          }),
        },
      });
    });

    it('should calculate total spent', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.exportClientData(1, 1, 10);

      expect(result.metadata.totalSpent).toBe(1000);
    });

    it('should throw error when client not found', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.exportClientData(999, 1, 10),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deleteUserAccount', () => {
    const mockRequestingUser = {
      id: 10,
      role: 'ADMIN',
    };

    const mockUser = {
      id: 5,
      tenantId: 1,
      email: 'user@example.com',
      name: 'Test User',
      role: 'AGENT',
      isActive: true,
    };

    it('should allow admin to delete other user accounts', async () => {
      prisma.user.findUnique.mockResolvedValue(mockRequestingUser);
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ id: 5, isActive: false });
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.deleteUserAccount(5, 1, 10);

      expect(result.success).toBe(true);
      expect(result.userId).toBe(5);
    });

    it('should allow user to delete own account', async () => {
      const selfUser = { id: 5, role: 'AGENT' };
      prisma.user.findUnique.mockResolvedValue(selfUser);
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ id: 5, isActive: false });
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      const result = await service.deleteUserAccount(5, 1, 5);

      expect(result.success).toBe(true);
    });

    it('should prevent deletion of OWNER accounts', async () => {
      const ownerUser = { ...mockUser, role: 'OWNER' };
      prisma.user.findUnique.mockResolvedValue(mockRequestingUser);
      prisma.user.findFirst.mockResolvedValue(ownerUser);

      await expect(
        service.deleteUserAccount(5, 1, 10),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.deleteUserAccount(5, 1, 10),
      ).rejects.toThrow('Cannot delete OWNER account');
    });

    it('should prevent non-admin from deleting other accounts', async () => {
      const regularUser = { id: 10, role: 'AGENT' };
      prisma.user.findUnique.mockResolvedValue(regularUser);

      await expect(
        service.deleteUserAccount(5, 1, 10),
      ).rejects.toThrow(ForbiddenException);

      await expect(
        service.deleteUserAccount(5, 1, 10),
      ).rejects.toThrow('You can only delete your own account');
    });

    it('should soft delete user account', async () => {
      prisma.user.findUnique.mockResolvedValue(mockRequestingUser);
      prisma.user.findFirst.mockResolvedValue(mockUser);
      prisma.user.update.mockResolvedValue({ id: 5 });
      prisma.auditLog.create.mockResolvedValue({ id: 1 });

      await service.deleteUserAccount(5, 1, 10);

      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: 5 },
        data: expect.objectContaining({
          isActive: false,
          email: expect.stringContaining('deleted-'),
          name: expect.stringContaining('Deleted User'),
        }),
      });
    });
  });

  describe('getComplianceStatus', () => {
    it('should return compliance status', async () => {
      prisma.client.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(85) // active
        .mockResolvedValueOnce(5); // anonymized

      prisma.user.count
        .mockResolvedValueOnce(20) // total
        .mockResolvedValueOnce(18); // active

      const result = await service.getComplianceStatus(1);

      expect(result.tenantId).toBe(1);
      expect(result.clients.total).toBe(100);
      expect(result.clients.active).toBe(85);
      expect(result.clients.inactive).toBe(15);
      expect(result.clients.anonymized).toBe(5);
      expect(result.users.total).toBe(20);
      expect(result.users.active).toBe(18);
      expect(result.gdprCompliance.dataExportAvailable).toBe(true);
      expect(result.gdprCompliance.rightToErasureAvailable).toBe(true);
    });
  });
});
