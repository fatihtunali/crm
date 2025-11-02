import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConsentService } from './consent.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ConsentPurpose } from './dto/create-consent.dto';

describe('ConsentService', () => {
  let service: ConsentService;
  let prisma: any;
  let auditLogsService: any;

  const mockPrismaService = {
    client: {
      findFirst: jest.fn(),
    },
    consent: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  const mockAuditLogsService = {
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConsentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: AuditLogsService,
          useValue: mockAuditLogsService,
        },
      ],
    }).compile();

    service = module.get<ConsentService>(ConsentService);
    prisma = module.get(PrismaService);
    auditLogsService = module.get(AuditLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('grantConsent', () => {
    const mockClient = {
      id: 1,
      tenantId: 1,
      name: 'John Doe',
      email: 'john@example.com',
    };

    const grantDto = {
      clientId: 1,
      purpose: ConsentPurpose.MARKETING_EMAIL,
      granted: true,
      version: '1.0',
      userId: 10,
    };

    const mockIpAddress = '192.168.1.1';
    const mockUserAgent = 'Mozilla/5.0';

    it('should grant consent successfully', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.consent.findFirst.mockResolvedValue(null); // No existing consent

      const mockConsent = {
        id: 1,
        tenantId: 1,
        clientId: 1,
        purpose: ConsentPurpose.MARKETING_EMAIL,
        granted: true,
        version: '1.0',
        grantedAt: new Date(),
        ipAddress: mockIpAddress,
        userAgent: mockUserAgent,
        userId: 10,
        revokedAt: null,
      };

      prisma.consent.create.mockResolvedValue(mockConsent);
      auditLogsService.create.mockResolvedValue({ id: 1 });

      const result = await service.grantConsent(
        grantDto,
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result).toEqual(mockConsent);
      expect(prisma.consent.create).toHaveBeenCalledWith({
        data: {
          tenantId: 1,
          clientId: 1,
          userId: 10,
          purpose: ConsentPurpose.MARKETING_EMAIL,
          granted: true,
          version: '1.0',
          grantedAt: expect.any(Date),
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
        },
      });
    });

    it('should create audit log entry', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.consent.findFirst.mockResolvedValue(null);
      prisma.consent.create.mockResolvedValue({ id: 1 });

      await service.grantConsent(grantDto, 1, mockIpAddress, mockUserAgent);

      expect(auditLogsService.create).toHaveBeenCalledWith({
        tenantId: 1,
        userId: 10,
        entity: 'Consent',
        entityId: 1,
        action: 'CONSENT_GRANTED',
        diffJson: {
          purpose: ConsentPurpose.MARKETING_EMAIL,
          version: '1.0',
          clientId: 1,
        },
        ipAddress: mockIpAddress,
        userAgent: mockUserAgent,
      });
    });

    it('should capture IP and User-Agent', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.consent.findFirst.mockResolvedValue(null);

      const mockConsent = {
        id: 1,
        ipAddress: '10.0.0.1',
        userAgent: 'Chrome/95.0',
      };

      prisma.consent.create.mockResolvedValue(mockConsent);

      const result = await service.grantConsent(
        grantDto,
        1,
        '10.0.0.1',
        'Chrome/95.0',
      );

      expect(result.ipAddress).toBe('10.0.0.1');
      expect(result.userAgent).toBe('Chrome/95.0');
    });

    it('should version consent', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.consent.findFirst.mockResolvedValue(null);

      const mockConsent = {
        id: 1,
        version: '2.0',
      };

      prisma.consent.create.mockResolvedValue(mockConsent);

      const result = await service.grantConsent(
        { ...grantDto, version: '2.0' },
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result.version).toBe('2.0');
    });

    it('should update existing consent if already exists', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);

      const existingConsent = {
        id: 1,
        tenantId: 1,
        clientId: 1,
        purpose: ConsentPurpose.MARKETING_EMAIL,
        granted: false,
        version: '1.0',
        revokedAt: null,
      };

      prisma.consent.findFirst.mockResolvedValue(existingConsent);

      const updatedConsent = {
        ...existingConsent,
        granted: true,
        version: '1.0',
        grantedAt: new Date(),
      };

      prisma.consent.update.mockResolvedValue(updatedConsent);

      const result = await service.grantConsent(
        grantDto,
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result.granted).toBe(true);
      expect(prisma.consent.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          granted: true,
          version: '1.0',
          grantedAt: expect.any(Date),
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
          userId: 10,
        },
      });
    });

    it('should throw error if client not found', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.grantConsent(grantDto, 1, mockIpAddress, mockUserAgent),
      ).rejects.toThrow(NotFoundException);

      await expect(
        service.grantConsent(grantDto, 1, mockIpAddress, mockUserAgent),
      ).rejects.toThrow('Client with ID 1 not found');
    });

    it('should handle consent denial', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.consent.findFirst.mockResolvedValue(null);

      const mockConsent = {
        id: 1,
        granted: false,
      };

      prisma.consent.create.mockResolvedValue(mockConsent);

      const result = await service.grantConsent(
        { ...grantDto, granted: false },
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result.granted).toBe(false);
      expect(auditLogsService.create).toHaveBeenCalledWith(
        expect.objectContaining({
          action: 'CONSENT_DENIED',
        }),
      );
    });

    it('should respect tenant isolation', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await service.grantConsent(grantDto, 2, mockIpAddress, mockUserAgent).catch(() => {});

      expect(prisma.client.findFirst).toHaveBeenCalledWith({
        where: { id: 1, tenantId: 2 },
      });
    });
  });

  describe('revokeConsent', () => {
    const mockConsent = {
      id: 1,
      tenantId: 1,
      clientId: 1,
      purpose: ConsentPurpose.MARKETING_EMAIL,
      granted: true,
      revokedAt: null,
    };

    it('should revoke consent', async () => {
      prisma.consent.findFirst.mockResolvedValue(mockConsent);

      const revokedConsent = {
        ...mockConsent,
        revokedAt: new Date(),
        granted: false,
      };

      prisma.consent.update.mockResolvedValue(revokedConsent);

      const result = await service.revokeConsent(1, 1, 10);

      expect(result.granted).toBe(false);
      expect(result.revokedAt).toBeDefined();
      expect(prisma.consent.update).toHaveBeenCalledWith({
        where: { id: 1 },
        data: {
          revokedAt: expect.any(Date),
          granted: false,
        },
      });
    });

    it('should set revokedAt timestamp', async () => {
      prisma.consent.findFirst.mockResolvedValue(mockConsent);

      const now = new Date();
      const revokedConsent = {
        ...mockConsent,
        revokedAt: now,
      };

      prisma.consent.update.mockResolvedValue(revokedConsent);

      const result = await service.revokeConsent(1, 1);

      expect(result.revokedAt).toBeDefined();
      expect(result.revokedAt).toBeInstanceOf(Date);
    });

    it('should create audit log', async () => {
      prisma.consent.findFirst.mockResolvedValue(mockConsent);
      prisma.consent.update.mockResolvedValue({
        ...mockConsent,
        revokedAt: new Date(),
      });

      await service.revokeConsent(1, 1, 10);

      expect(auditLogsService.create).toHaveBeenCalledWith({
        tenantId: 1,
        userId: 10,
        entity: 'Consent',
        entityId: 1,
        action: 'CONSENT_REVOKED',
        diffJson: expect.objectContaining({
          purpose: ConsentPurpose.MARKETING_EMAIL,
          clientId: 1,
          revokedAt: expect.any(Date),
        }),
        ipAddress: null,
        userAgent: null,
      });
    });

    it('should throw error if consent not found', async () => {
      prisma.consent.findFirst.mockResolvedValue(null);

      await expect(service.revokeConsent(999, 1)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.revokeConsent(999, 1)).rejects.toThrow(
        'Consent with ID 999 not found',
      );
    });

    it('should throw error if already revoked', async () => {
      const alreadyRevoked = {
        ...mockConsent,
        revokedAt: new Date(),
      };

      prisma.consent.findFirst.mockResolvedValue(alreadyRevoked);

      await expect(service.revokeConsent(1, 1)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.revokeConsent(1, 1)).rejects.toThrow(
        'already been revoked',
      );
    });

    it('should respect tenant isolation', async () => {
      prisma.consent.findFirst.mockResolvedValue(null);

      await service.revokeConsent(1, 2).catch(() => {});

      expect(prisma.consent.findFirst).toHaveBeenCalledWith({
        where: { id: 1, tenantId: 2 },
      });
    });
  });

  describe('hasConsent', () => {
    it('should return true for granted consent', async () => {
      const mockConsent = {
        id: 1,
        granted: true,
        revokedAt: null,
      };

      prisma.consent.findFirst.mockResolvedValue(mockConsent);

      const result = await service.hasConsent(1, ConsentPurpose.MARKETING_EMAIL, 1);

      expect(result).toBe(true);
      expect(prisma.consent.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          clientId: 1,
          purpose: ConsentPurpose.MARKETING_EMAIL,
          granted: true,
          revokedAt: null,
        },
      });
    });

    it('should return false for revoked consent', async () => {
      prisma.consent.findFirst.mockResolvedValue(null);

      const result = await service.hasConsent(1, ConsentPurpose.MARKETING_EMAIL, 1);

      expect(result).toBe(false);
    });

    it('should return false for non-existent consent', async () => {
      prisma.consent.findFirst.mockResolvedValue(null);

      const result = await service.hasConsent(1, ConsentPurpose.ANALYTICS, 1);

      expect(result).toBe(false);
    });

    it('should check specific purpose', async () => {
      prisma.consent.findFirst.mockResolvedValue({ id: 1 });

      await service.hasConsent(1, ConsentPurpose.PROFILING, 1);

      expect(prisma.consent.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            purpose: ConsentPurpose.PROFILING,
          }),
        }),
      );
    });
  });

  describe('bulkGrantConsent', () => {
    const mockClient = {
      id: 1,
      tenantId: 1,
    };

    const bulkDto = {
      clientId: 1,
      version: '1.0',
      purposes: [
        { purpose: ConsentPurpose.MARKETING_EMAIL },
        { purpose: ConsentPurpose.ANALYTICS },
        { purpose: ConsentPurpose.PROFILING },
      ],
    };

    it('should grant multiple consents', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.consent.findFirst.mockResolvedValue(null);
      prisma.consent.create.mockResolvedValue({ id: 1 });

      const result = await service.bulkGrantConsent(
        bulkDto,
        1,
        '192.168.1.1',
        'Mozilla/5.0',
        10,
      );

      expect(result.consentsGranted).toBe(3);
      expect(result.consents).toHaveLength(3);
      expect(prisma.consent.create).toHaveBeenCalledTimes(3);
    });

    it('should create audit logs for each consent', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);
      prisma.consent.findFirst.mockResolvedValue(null);
      prisma.consent.create.mockResolvedValue({ id: 1 });

      await service.bulkGrantConsent(
        bulkDto,
        1,
        '192.168.1.1',
        'Mozilla/5.0',
        10,
      );

      expect(auditLogsService.create).toHaveBeenCalledTimes(3);
    });

    it('should handle empty purposes array', async () => {
      prisma.client.findFirst.mockResolvedValue(mockClient);

      const result = await service.bulkGrantConsent(
        { ...bulkDto, purposes: [] },
        1,
        '192.168.1.1',
        'Mozilla/5.0',
      );

      expect(result.consentsGranted).toBe(0);
      expect(result.consents).toHaveLength(0);
    });

    it('should propagate errors on failure', async () => {
      prisma.client.findFirst.mockResolvedValue(null);

      await expect(
        service.bulkGrantConsent(
          bulkDto,
          1,
          '192.168.1.1',
          'Mozilla/5.0',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('getClientConsents', () => {
    it('should return active consents only', async () => {
      const mockConsents = [
        { id: 1, purpose: ConsentPurpose.MARKETING_EMAIL, revokedAt: null },
        { id: 2, purpose: ConsentPurpose.ANALYTICS, revokedAt: null },
      ];

      prisma.consent.findMany.mockResolvedValue(mockConsents);

      const result = await service.getClientConsents(1, 1);

      expect(result).toEqual(mockConsents);
      expect(prisma.consent.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          clientId: 1,
          revokedAt: null,
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should not return revoked consents', async () => {
      prisma.consent.findMany.mockResolvedValue([]);

      await service.getClientConsents(1, 1);

      expect(prisma.consent.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            revokedAt: null,
          }),
        }),
      );
    });
  });

  describe('getConsentHistory', () => {
    it('should return all consents including revoked', async () => {
      const mockHistory = [
        { id: 1, revokedAt: null },
        { id: 2, revokedAt: new Date() },
      ];

      prisma.consent.findMany.mockResolvedValue(mockHistory);

      const result = await service.getConsentHistory(1, 1);

      expect(result).toEqual(mockHistory);
      expect(prisma.consent.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          clientId: 1,
        },
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      });
    });
  });

  describe('getConsentStatistics', () => {
    it('should return statistics', async () => {
      prisma.consent.count
        .mockResolvedValueOnce(100) // total
        .mockResolvedValueOnce(80) // active
        .mockResolvedValueOnce(20); // revoked

      prisma.consent.groupBy.mockResolvedValue([
        { purpose: ConsentPurpose.MARKETING_EMAIL, _count: 50 },
        { purpose: ConsentPurpose.ANALYTICS, _count: 30 },
      ]);

      const result = await service.getConsentStatistics(1);

      expect(result.totalConsents).toBe(100);
      expect(result.activeConsents).toBe(80);
      expect(result.revokedConsents).toBe(20);
      expect(result.byPurpose).toHaveLength(2);
    });
  });

  describe('updatePrivacyVersion', () => {
    it('should return count of consents needing review', async () => {
      prisma.consent.count.mockResolvedValue(25);

      const result = await service.updatePrivacyVersion('2.0', 1);

      expect(result.newVersion).toBe('2.0');
      expect(result.consentsNeedingReview).toBe(25);
      expect(result.message).toContain('2.0');
    });
  });
});
