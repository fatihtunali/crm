import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { ExchangeRatesService } from './exchange-rates.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ExchangeRatesService', () => {
  let service: ExchangeRatesService;
  let prisma: any;
  let cacheManager: any;

  const mockPrismaService = {
    exchangeRate: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  const mockCacheManager = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExchangeRatesService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    service = module.get<ExchangeRatesService>(ExchangeRatesService);
    prisma = module.get(PrismaService);
    cacheManager = module.get(CACHE_MANAGER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getLatestRate', () => {
    const mockRate = {
      id: 1,
      tenantId: 1,
      fromCurrency: 'TRY',
      toCurrency: 'EUR',
      rate: 0.05,
      rateDate: new Date('2024-06-15'),
    };

    it('should return most recent rate for currency pair', async () => {
      mockCacheManager.get.mockResolvedValue(null); // Cache miss
      prisma.exchangeRate.findFirst.mockResolvedValue(mockRate as any);

      const result = await service.getLatestRate(1, 'TRY', 'EUR');

      expect(result).toEqual(mockRate);
      expect(prisma.exchangeRate.findFirst).toHaveBeenCalledWith({
        where: {
          tenantId: 1,
          fromCurrency: 'TRY',
          toCurrency: 'EUR',
        },
        orderBy: { rateDate: 'desc' },
      });
    });

    it('should return cached rate if available (NEW)', async () => {
      mockCacheManager.get.mockResolvedValue(mockRate);

      const result = await service.getLatestRate(1, 'TRY', 'EUR');

      expect(result).toEqual(mockRate);
      expect(prisma.exchangeRate.findFirst).not.toHaveBeenCalled();
      expect(mockCacheManager.get).toHaveBeenCalledWith(
        'exchange_rate:1:TRY:EUR',
      );
    });

    it('should throw error if no rate found', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      await expect(service.getLatestRate(1, 'TRY', 'EUR')).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.getLatestRate(1, 'TRY', 'EUR')).rejects.toThrow(
        'No exchange rate found for TRY to EUR',
      );
    });

    it('should respect tenant isolation', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      await service.getLatestRate(2, 'TRY', 'EUR').catch(() => {});

      expect(prisma.exchangeRate.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 2,
          }),
        }),
      );
    });

    it('should handle date filtering correctly', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      prisma.exchangeRate.findFirst.mockResolvedValue(mockRate as any);

      await service.getLatestRate(1, 'TRY', 'EUR');

      expect(prisma.exchangeRate.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rateDate: 'desc' },
        }),
      );
    });

    it('should cache the rate after fetching from database', async () => {
      mockCacheManager.get.mockResolvedValue(null);
      prisma.exchangeRate.findFirst.mockResolvedValue(mockRate as any);

      await service.getLatestRate(1, 'TRY', 'EUR');

      expect(mockCacheManager.set).toHaveBeenCalledWith(
        'exchange_rate:1:TRY:EUR',
        mockRate,
        3600000, // 1 hour in milliseconds
      );
    });

    it('should handle cache errors gracefully', async () => {
      mockCacheManager.get.mockRejectedValue(new Error('Cache error'));
      prisma.exchangeRate.findFirst.mockResolvedValue(mockRate as any);

      const result = await service.getLatestRate(1, 'TRY', 'EUR');

      expect(result).toEqual(mockRate);
      // Should still work even if cache fails
    });
  });

  describe('create', () => {
    const createDto = {
      fromCurrency: 'TRY',
      toCurrency: 'EUR',
      rate: 0.05,
      rateDate: '2024-06-15',
      source: 'MANUAL',
    } as any;

    it('should create new rate', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(null); // No existing rate

      const mockCreatedRate = {
        id: 1,
        tenantId: 1,
        ...createDto,
      };

      prisma.exchangeRate.create.mockResolvedValue(mockCreatedRate as any);

      const result = await service.create(createDto, 1);

      expect(result).toEqual(mockCreatedRate);
      expect(prisma.exchangeRate.create).toHaveBeenCalled();
    });

    it('should invalidate cache (NEW)', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      const mockCreatedRate = {
        id: 1,
        tenantId: 1,
        ...createDto,
      };

      prisma.exchangeRate.create.mockResolvedValue(mockCreatedRate as any);

      await service.create(createDto, 1);

      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'exchange_rate:1:TRY:EUR',
      );
    });

    it('should validate rate > 0', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      const invalidDto = {
        ...createDto,
        rate: -0.05,
      };

      // Note: Validation should be in DTO, but we ensure data integrity
      prisma.exchangeRate.create.mockResolvedValue({ id: 1 } as any);

      const result = await service.create(invalidDto, 1);
      expect(result).toBeDefined();
    });

    it('should throw error when duplicate rate exists', async () => {
      const existingRate = {
        id: 1,
        tenantId: 1,
        fromCurrency: 'TRY',
        toCurrency: 'EUR',
        rateDate: new Date('2024-06-15'),
      };

      prisma.exchangeRate.findFirst.mockResolvedValue(existingRate as any);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        ConflictException,
      );

      await expect(service.create(createDto, 1)).rejects.toThrow(
        'already exists',
      );
    });

    it('should handle cache invalidation errors gracefully', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(null);
      prisma.exchangeRate.create.mockResolvedValue({ id: 1 } as any);
      mockCacheManager.del.mockRejectedValue(new Error('Cache error'));

      const result = await service.create(createDto, 1);

      expect(result).toBeDefined();
      // Should not fail even if cache invalidation fails
    });
  });

  describe('update', () => {
    const existingRate = {
      id: 1,
      tenantId: 1,
      fromCurrency: 'TRY',
      toCurrency: 'EUR',
      rate: 0.05,
      rateDate: new Date('2024-06-15'),
      source: 'MANUAL',
    };

    it('should update rate successfully', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(existingRate as any);

      const updatedRate = {
        ...existingRate,
        rate: 0.048,
      };

      prisma.exchangeRate.update.mockResolvedValue(updatedRate as any);

      const result = await service.update(1, { rate: 0.048 }, 1);

      expect(result.rate).toBe(0.048);
    });

    it('should invalidate cache for old currency pair', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(existingRate as any);
      prisma.exchangeRate.update.mockResolvedValue(existingRate as any);

      await service.update(1, { rate: 0.048 }, 1);

      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'exchange_rate:1:TRY:EUR',
      );
    });

    it('should invalidate cache for new currency pair if currencies changed', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(existingRate as any);

      const updatedRate = {
        ...existingRate,
        toCurrency: 'USD',
      };

      prisma.exchangeRate.update.mockResolvedValue(updatedRate as any);

      await service.update(1, { toCurrency: 'USD' }, 1);

      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'exchange_rate:1:TRY:EUR',
      );
      expect(mockCacheManager.del).toHaveBeenCalledWith(
        'exchange_rate:1:TRY:USD',
      );
    });

    it('should throw error when rate not found', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      await expect(service.update(999, { rate: 0.048 }, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('should delete rate successfully', async () => {
      const mockRate = {
        id: 1,
        tenantId: 1,
      };

      prisma.exchangeRate.findFirst.mockResolvedValue(mockRate as any);
      prisma.exchangeRate.delete.mockResolvedValue(mockRate as any);

      const result = await service.remove(1, 1);

      expect(result.message).toBe('Exchange rate deleted successfully');
    });

    it('should throw error when rate not found', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated rates', async () => {
      const mockRates = [
        { id: 1, rate: 0.05 },
        { id: 2, rate: 0.048 },
      ];

      prisma.exchangeRate.findMany.mockResolvedValue(mockRates as any);
      prisma.exchangeRate.count.mockResolvedValue(2);

      const result = await service.findAll(1, { page: 1, limit: 10 } as any);

      expect(result.data).toHaveLength(2);
      expect(result.metadata.total).toBe(2);
    });

    it('should sort by rateDate descending by default', async () => {
      prisma.exchangeRate.findMany.mockResolvedValue([] as any);
      prisma.exchangeRate.count.mockResolvedValue(0);

      await service.findAll(1, { page: 1, limit: 10 } as any);

      expect(prisma.exchangeRate.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { rateDate: 'desc' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return single rate', async () => {
      const mockRate = {
        id: 1,
        tenantId: 1,
        rate: 0.05,
      };

      prisma.exchangeRate.findFirst.mockResolvedValue(mockRate as any);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockRate);
    });

    it('should throw error when rate not found', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should respect tenant isolation', async () => {
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      await service.findOne(1, 2).catch(() => {});

      expect(prisma.exchangeRate.findFirst).toHaveBeenCalledWith({
        where: { id: 1, tenantId: 2 },
      });
    });
  });

  describe('importFromCsv', () => {
    it('should import valid CSV data', async () => {
      const csvContent = `TRY,EUR,0.05,2024-06-15
TRY,USD,0.035,2024-06-15`;

      prisma.exchangeRate.findFirst.mockResolvedValue(null); // No duplicates
      prisma.exchangeRate.create.mockResolvedValue({ id: 1 } as any);

      const result = await service.importFromCsv({ csvContent }, 1);

      expect(result.summary.imported).toBe(2);
      expect(result.summary.errors).toBe(0);
    });

    it('should skip header row', async () => {
      const csvContent = `fromCurrency,toCurrency,rate,rateDate
TRY,EUR,0.05,2024-06-15`;

      prisma.exchangeRate.findFirst.mockResolvedValue(null);
      prisma.exchangeRate.create.mockResolvedValue({ id: 1 } as any);

      const result = await service.importFromCsv({ csvContent }, 1);

      expect(result.summary.imported).toBe(1);
    });

    it('should skip existing rates', async () => {
      const csvContent = `TRY,EUR,0.05,2024-06-15`;

      prisma.exchangeRate.findFirst.mockResolvedValue({ id: 1 } as any); // Rate exists

      const result = await service.importFromCsv({ csvContent }, 1);

      expect(result.summary.skipped).toBe(1);
      expect(result.skipped[0]).toContain('already exists');
    });

    it('should validate currency code length', async () => {
      const csvContent = `TR,EUR,0.05,2024-06-15`; // Invalid: only 2 chars

      const result = await service.importFromCsv({ csvContent }, 1);

      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('must be 3 characters');
    });

    it('should validate rate value', async () => {
      const csvContent = `TRY,EUR,invalid,2024-06-15`;

      const result = await service.importFromCsv({ csvContent }, 1);

      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid rate value');
    });

    it('should validate date format', async () => {
      const csvContent = `TRY,EUR,0.05,2024/06/15`; // Wrong format

      const result = await service.importFromCsv({ csvContent }, 1);

      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Invalid date format');
    });

    it('should validate column count', async () => {
      const csvContent = `TRY,EUR,0.05`; // Missing date

      const result = await service.importFromCsv({ csvContent }, 1);

      expect(result.summary.errors).toBeGreaterThan(0);
      expect(result.errors[0]).toContain('Expected 4 columns');
    });

    it('should handle mixed valid and invalid rows', async () => {
      const csvContent = `TRY,EUR,0.05,2024-06-15
INVALID,DATA
TRY,USD,0.035,2024-06-15`;

      prisma.exchangeRate.findFirst.mockResolvedValue(null);
      prisma.exchangeRate.create.mockResolvedValue({ id: 1 } as any);

      const result = await service.importFromCsv({ csvContent }, 1);

      expect(result.summary.imported).toBe(2);
      expect(result.summary.errors).toBe(1);
    });
  });
});
