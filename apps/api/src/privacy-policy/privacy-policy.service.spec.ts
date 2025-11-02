import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

describe('PrivacyPolicyService', () => {
  let service: PrivacyPolicyService;
  let prisma: any;
  let auditLogsService: any;

  const mockPrismaService = {
    privacyPolicyAcceptance: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
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
        PrivacyPolicyService,
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

    service = module.get<PrivacyPolicyService>(PrivacyPolicyService);
    prisma = module.get(PrismaService);
    auditLogsService = module.get(AuditLogsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('recordAcceptance', () => {
    const acceptDto = {
      userId: 1,
      clientId: null,
      version: '1.0.0',
    };

    const mockIpAddress = '192.168.1.1';
    const mockUserAgent = 'Mozilla/5.0';

    it('should record acceptance', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);

      const mockAcceptance = {
        id: 1,
        tenantId: 1,
        userId: 1,
        clientId: null,
        version: '1.0.0',
        acceptedAt: new Date(),
        ipAddress: mockIpAddress,
        userAgent: mockUserAgent,
      };

      prisma.privacyPolicyAcceptance.create.mockResolvedValue(mockAcceptance);

      const result = await service.recordAcceptance(
        acceptDto,
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result.message).toBe('Privacy policy accepted successfully');
      expect(result.acceptance).toEqual(mockAcceptance);
      expect(prisma.privacyPolicyAcceptance.create).toHaveBeenCalledWith({
        data: {
          tenantId: 1,
          userId: 1,
          clientId: null,
          version: '1.0.0',
          acceptedAt: expect.any(Date),
          ipAddress: mockIpAddress,
          userAgent: mockUserAgent,
        },
      });
    });

    it('should capture IP and User-Agent', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);

      const mockAcceptance = {
        id: 1,
        ipAddress: '10.0.0.1',
        userAgent: 'Chrome/95.0',
      };

      prisma.privacyPolicyAcceptance.create.mockResolvedValue(mockAcceptance);

      const result = await service.recordAcceptance(
        acceptDto,
        1,
        '10.0.0.1',
        'Chrome/95.0',
      );

      expect(result.acceptance.ipAddress).toBe('10.0.0.1');
      expect(result.acceptance.userAgent).toBe('Chrome/95.0');
    });

    it('should create audit log', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);
      prisma.privacyPolicyAcceptance.create.mockResolvedValue({ id: 1 });

      await service.recordAcceptance(
        acceptDto,
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(auditLogsService.create).toHaveBeenCalledWith({
        tenantId: 1,
        userId: 1,
        entity: 'PrivacyPolicyAcceptance',
        entityId: 1,
        action: 'PRIVACY_POLICY_ACCEPTED',
        diffJson: {
          version: '1.0.0',
          userId: 1,
          clientId: null,
        },
        ipAddress: mockIpAddress,
        userAgent: mockUserAgent,
      });
    });

    it('should throw error if neither userId nor clientId provided', async () => {
      const invalidDto = {
        userId: null,
        clientId: null,
        version: '1.0.0',
      };

      await expect(
        service.recordAcceptance(invalidDto as any, 1, mockIpAddress, mockUserAgent),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.recordAcceptance(invalidDto as any, 1, mockIpAddress, mockUserAgent),
      ).rejects.toThrow('Either userId or clientId must be provided');
    });

    it('should handle clientId acceptance', async () => {
      const clientDto = {
        userId: null,
        clientId: 5,
        version: '1.0.0',
      };

      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);

      const mockAcceptance = {
        id: 1,
        userId: null,
        clientId: 5,
      };

      prisma.privacyPolicyAcceptance.create.mockResolvedValue(mockAcceptance);

      const result = await service.recordAcceptance(
        clientDto as any,
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result.acceptance.clientId).toBe(5);
      expect(result.acceptance.userId).toBeNull();
    });

    it('should not create duplicate acceptance for same version', async () => {
      const existingAcceptance = {
        id: 1,
        version: '1.0.0',
        acceptedAt: new Date(),
      };

      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(existingAcceptance);

      const result = await service.recordAcceptance(
        acceptDto,
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result.message).toBe('Privacy policy already accepted for this version');
      expect(result.acceptance).toEqual(existingAcceptance);
      expect(prisma.privacyPolicyAcceptance.create).not.toHaveBeenCalled();
    });

    it('should accept different versions separately', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);
      prisma.privacyPolicyAcceptance.create.mockResolvedValue({ id: 1, version: '2.0.0' });

      const result = await service.recordAcceptance(
        { ...acceptDto, version: '2.0.0' },
        1,
        mockIpAddress,
        mockUserAgent,
      );

      expect(result.acceptance.version).toBe('2.0.0');
    });

    it('should respect tenant isolation', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);
      prisma.privacyPolicyAcceptance.create.mockResolvedValue({ id: 1 });

      await service.recordAcceptance(acceptDto, 2, mockIpAddress, mockUserAgent);

      expect(prisma.privacyPolicyAcceptance.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tenantId: 2,
          }),
        }),
      );
    });
  });

  describe('requiresReAcceptance', () => {
    it('should return true for outdated version', async () => {
      const oldAcceptance = {
        id: 1,
        version: '0.9.0',
        acceptedAt: new Date(),
      };

      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(oldAcceptance);

      const result = await service.requiresReAcceptance(1, null, 1);

      expect(result).toBe(true);
    });

    it('should return false for current version', async () => {
      const currentAcceptance = {
        id: 1,
        version: '1.0.0', // Matches CURRENT_VERSION
        acceptedAt: new Date(),
      };

      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(currentAcceptance);

      const result = await service.requiresReAcceptance(1, null, 1);

      expect(result).toBe(false);
    });

    it('should return true when no acceptance exists', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);

      const result = await service.requiresReAcceptance(1, null, 1);

      expect(result).toBe(true);
    });

    it('should check userId acceptance', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);

      await service.requiresReAcceptance(5, null, 1);

      expect(prisma.privacyPolicyAcceptance.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          userId: 5,
          clientId: null,
        },
        orderBy: {
          acceptedAt: 'desc',
        },
      });
    });

    it('should check clientId acceptance', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);

      await service.requiresReAcceptance(null, 10, 1);

      expect(prisma.privacyPolicyAcceptance.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          userId: null,
          clientId: 10,
        },
        orderBy: {
          acceptedAt: 'desc',
        },
      });
    });
  });

  describe('getLatestAcceptance', () => {
    it('should return most recent acceptance', async () => {
      const mockAcceptance = {
        id: 2,
        version: '1.0.0',
        acceptedAt: new Date('2024-06-15'),
      };

      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(mockAcceptance);

      const result = await service.getLatestAcceptance(1, null, 1);

      expect(result).toEqual(mockAcceptance);
      expect(prisma.privacyPolicyAcceptance.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          userId: 1,
          clientId: null,
        },
        orderBy: {
          acceptedAt: 'desc',
        },
      });
    });

    it('should return null if no acceptance', async () => {
      prisma.privacyPolicyAcceptance.findFirst.mockResolvedValue(null);

      const result = await service.getLatestAcceptance(1, null, 1);

      expect(result).toBeNull();
    });
  });

  describe('getCurrentVersion', () => {
    it('should return current version', async () => {
      const version = await service.getCurrentVersion(1);

      expect(version).toBe('1.0.0');
    });
  });

  describe('getUserAcceptances', () => {
    it('should return all user acceptances', async () => {
      const mockAcceptances = [
        { id: 1, version: '1.0.0', acceptedAt: new Date('2024-06-15') },
        { id: 2, version: '0.9.0', acceptedAt: new Date('2024-01-01') },
      ];

      prisma.privacyPolicyAcceptance.findMany.mockResolvedValue(mockAcceptances);

      const result = await service.getUserAcceptances(1, 1);

      expect(result).toEqual(mockAcceptances);
      expect(prisma.privacyPolicyAcceptance.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          userId: 1,
        },
        orderBy: {
          acceptedAt: 'desc',
        },
      });
    });
  });

  describe('getClientAcceptances', () => {
    it('should return all client acceptances', async () => {
      const mockAcceptances = [
        { id: 1, version: '1.0.0', acceptedAt: new Date() },
      ];

      prisma.privacyPolicyAcceptance.findMany.mockResolvedValue(mockAcceptances);

      const result = await service.getClientAcceptances(5, 1);

      expect(result).toEqual(mockAcceptances);
      expect(prisma.privacyPolicyAcceptance.findMany).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          clientId: 5,
        },
        orderBy: {
          acceptedAt: 'desc',
        },
      });
    });
  });

  describe('getAcceptanceStatistics', () => {
    it('should return statistics', async () => {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      prisma.privacyPolicyAcceptance.count
        .mockResolvedValueOnce(150) // total
        .mockResolvedValueOnce(45); // last 30 days

      prisma.privacyPolicyAcceptance.groupBy.mockResolvedValue([
        { version: '1.0.0', _count: 100 },
        { version: '0.9.0', _count: 50 },
      ]);

      const result = await service.getAcceptanceStatistics(1);

      expect(result.totalAcceptances).toBe(150);
      expect(result.currentVersion).toBe('1.0.0');
      expect(result.acceptancesLast30Days).toBe(45);
      expect(result.byVersion).toHaveLength(2);
      expect(result.byVersion[0]).toEqual({ version: '1.0.0', count: 100 });
    });

    it('should filter by tenant', async () => {
      prisma.privacyPolicyAcceptance.count.mockResolvedValue(0);
      prisma.privacyPolicyAcceptance.groupBy.mockResolvedValue([]);

      await service.getAcceptanceStatistics(2);

      expect(prisma.privacyPolicyAcceptance.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 2,
          }),
        }),
      );
    });
  });
});
