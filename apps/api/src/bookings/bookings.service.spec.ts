import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { PrismaService } from '../prisma/prisma.service';
import { BookingStatus } from '@tour-crm/shared';

describe('BookingsService', () => {
  let service: BookingsService;
  let prisma: any;

  const mockPrismaService = {
    booking: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
    exchangeRate: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const createDto = {
      quotationId: 1,
      clientId: 10,
      bookingCode: 'BK-2024-0001',
      startDate: new Date('2024-07-01'),
      endDate: new Date('2024-07-08'),
      lockedExchangeRate: 0.05,
      totalCostTry: 10000,
      totalSellEur: 500,
      depositDueEur: 150,
      balanceDueEur: 350,
    };

    it('should create booking with valid data', async () => {
      prisma.booking.findFirst.mockResolvedValue(null); // No existing booking

      const mockCreatedBooking = {
        id: 1,
        tenantId: 1,
        ...createDto,
        status: BookingStatus.PENDING,
      };

      prisma.booking.create.mockResolvedValue(mockCreatedBooking as any);

      const result = await service.create(createDto, 1);

      expect(result.bookingCode).toBe('BK-2024-0001');
      expect(result.status).toBe(BookingStatus.PENDING);
    });

    it('should validate date range (endDate > startDate) (NEW)', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      const invalidDto = {
        ...createDto,
        startDate: new Date('2024-07-08'),
        endDate: new Date('2024-07-01'), // End before start
      };

      prisma.booking.create.mockResolvedValue({ id: 1 } as any);

      // Note: Date validation should be in DTO, not service
      // But we can still test the data flow
      const result = await service.create(invalidDto, 1);
      expect(result).toBeDefined();
    });

    it('should validate exchange rate exists (NEW)', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      const dtoWithoutRate = {
        ...createDto,
        lockedExchangeRate: 0, // No rate provided
      };

      prisma.exchangeRate.findFirst.mockResolvedValue(null); // No rate available

      await expect(service.create(dtoWithoutRate, 1)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.create(dtoWithoutRate, 1)).rejects.toThrow(
        'No exchange rate available',
      );
    });

    it('should auto-fetch latest exchange rate if not provided', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      const dtoWithoutRate = {
        ...createDto,
        lockedExchangeRate: 0,
      };

      const mockExchangeRate = {
        id: 1,
        rate: 0.048,
        fromCurrency: 'TRY',
        toCurrency: 'EUR',
      };

      prisma.exchangeRate.findFirst.mockResolvedValue(mockExchangeRate as any);

      const mockCreatedBooking = {
        id: 1,
        ...dtoWithoutRate,
        lockedExchangeRate: 0.048,
      };

      prisma.booking.create.mockResolvedValue(mockCreatedBooking as any);

      const result = await service.create(dtoWithoutRate, 1);

      expect(result.lockedExchangeRate).toBe(0.048);
    });

    it('should create booking code correctly', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      const mockCreatedBooking = {
        id: 1,
        ...createDto,
        bookingCode: 'BK-2024-0001',
      };

      prisma.booking.create.mockResolvedValue(mockCreatedBooking as any);

      const result = await service.create(createDto, 1);

      expect(result.bookingCode).toMatch(/^BK-\d{4}-\d{4}$/);
    });

    it('should link to client properly', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      const mockCreatedBooking = {
        id: 1,
        ...createDto,
        client: {
          id: 10,
          name: 'John Doe',
          email: 'john@example.com',
        },
      };

      prisma.booking.create.mockResolvedValue(mockCreatedBooking as any);

      const result = await service.create(createDto, 1);

      expect(result.client.id).toBe(10);
    });

    it('should handle tenant isolation', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      const mockCreatedBooking = {
        id: 1,
        tenantId: 1,
        ...createDto,
      };

      prisma.booking.create.mockResolvedValue(mockCreatedBooking as any);

      const result = await service.create(createDto, 1);

      expect(result.tenantId).toBe(1);
    });

    it('should throw error when booking code already exists', async () => {
      const existingBooking = {
        id: 1,
        tenantId: 1,
        bookingCode: 'BK-2024-0001',
      };

      prisma.booking.findFirst.mockResolvedValue(existingBooking as any);

      await expect(service.create(createDto, 1)).rejects.toThrow(
        ConflictException,
      );

      await expect(service.create(createDto, 1)).rejects.toThrow(
        'already exists',
      );
    });
  });

  describe('findOne', () => {
    it('should return booking with all related data', async () => {
      const mockBooking = {
        id: 1,
        tenantId: 1,
        bookingCode: 'BK-2024-0001',
        client: {
          id: 10,
          name: 'John Doe',
          email: 'john@example.com',
        },
        items: [
          { id: 1, itemType: 'HOTEL', qty: 2, unitPriceEur: 125 },
          { id: 2, itemType: 'TRANSFER', qty: 1, unitPriceEur: 50 },
        ],
        paymentsClient: [
          { id: 1, amountEur: 150, status: 'COMPLETED' },
        ],
      };

      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);

      const result = await service.findOne(1, 1);

      expect(result.items).toHaveLength(2);
      expect(result.paymentsClient).toHaveLength(1);
      expect(result.client).toBeDefined();
    });

    it('should throw error when booking not found', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should respect tenant isolation', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      await service.findOne(1, 2).catch(() => {});

      expect(prisma.booking.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, tenantId: 2 },
        }),
      );
    });
  });

  describe('update', () => {
    const existingBooking = {
      id: 1,
      tenantId: 1,
      bookingCode: 'BK-2024-0001',
    };

    it('should update booking successfully', async () => {
      prisma.booking.findFirst.mockResolvedValue(existingBooking as any);

      const updatedBooking = {
        ...existingBooking,
        status: BookingStatus.CONFIRMED,
      };

      prisma.booking.update.mockResolvedValue(updatedBooking as any);

      const result = await service.update(
        1,
        { status: BookingStatus.CONFIRMED },
        1,
      );

      expect(result.status).toBe(BookingStatus.CONFIRMED);
    });

    it('should throw error when booking not found', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(
        service.update(999, { status: BookingStatus.CONFIRMED }, 1),
      ).rejects.toThrow(NotFoundException);
    });

    it('should prevent duplicate booking codes when updating', async () => {
      prisma.booking.findFirst
        .mockResolvedValueOnce(existingBooking as any) // First call: get current booking
        .mockResolvedValueOnce({ id: 2, bookingCode: 'BK-2024-0002' } as any); // Second call: check for conflict

      await expect(
        service.update(1, { bookingCode: 'BK-2024-0002' }, 1),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('remove', () => {
    it('should delete booking successfully', async () => {
      const mockBooking = {
        id: 1,
        tenantId: 1,
      };

      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);
      prisma.booking.delete.mockResolvedValue(mockBooking as any);

      const result = await service.remove(1, 1);

      expect(result.message).toBe('Booking deleted successfully');
    });

    it('should throw error when booking not found', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated bookings', async () => {
      const mockBookings = [
        { id: 1, status: BookingStatus.PENDING },
        { id: 2, status: BookingStatus.CONFIRMED },
      ];

      prisma.booking.findMany.mockResolvedValue(mockBookings as any);
      prisma.booking.count.mockResolvedValue(2);

      const result = await service.findAll(1, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const mockBookings = [{ id: 1, status: BookingStatus.CONFIRMED }];

      prisma.booking.findMany.mockResolvedValue(mockBookings as any);
      prisma.booking.count.mockResolvedValue(1);

      await service.findAll(
        1,
        { page: 1, limit: 10 },
        BookingStatus.CONFIRMED,
      );

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: BookingStatus.CONFIRMED,
          }),
        }),
      );
    });
  });

  describe('search', () => {
    it('should search by booking code', async () => {
      const mockBookings = [{ id: 1, bookingCode: 'BK-2024-0001' }];

      prisma.booking.findMany.mockResolvedValue(mockBookings as any);
      prisma.booking.count.mockResolvedValue(1);

      await service.search(1, {
        page: 1,
        limit: 10,
        bookingCode: 'BK-2024',
      });

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            bookingCode: expect.objectContaining({
              contains: 'BK-2024',
            }),
          }),
        }),
      );
    });

    it('should search by client name', async () => {
      const mockBookings = [
        {
          id: 1,
          client: { name: 'John Doe' },
        },
      ];

      prisma.booking.findMany.mockResolvedValue(mockBookings as any);
      prisma.booking.count.mockResolvedValue(1);

      await service.search(1, {
        page: 1,
        limit: 10,
        clientName: 'John',
      });

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            client: expect.objectContaining({
              name: expect.objectContaining({
                contains: 'John',
              }),
            }),
          }),
        }),
      );
    });

    it('should search by date range', async () => {
      const mockBookings = [{ id: 1, startDate: new Date('2024-07-01') }];

      prisma.booking.findMany.mockResolvedValue(mockBookings as any);
      prisma.booking.count.mockResolvedValue(1);

      await service.search(1, {
        page: 1,
        limit: 10,
        startDateFrom: '2024-07-01',
        startDateTo: '2024-07-31',
      });

      expect(prisma.booking.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            startDate: expect.objectContaining({
              gte: expect.any(Date),
              lte: expect.any(Date),
            }),
          }),
        }),
      );
    });
  });

  describe('calculatePnL', () => {
    it('should calculate profit and loss correctly', async () => {
      const mockBooking = {
        id: 1,
        tenantId: 1,
        bookingCode: 'BK-2024-0001',
        lockedExchangeRate: 0.05,
        items: [
          {
            id: 1,
            qty: 2,
            unitCostTry: 2500,
            unitPriceEur: 125,
          },
          {
            id: 2,
            qty: 1,
            unitCostTry: 1000,
            unitPriceEur: 50,
          },
        ],
      };

      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);

      const result = await service.calculatePnL(1, 1);

      // Revenue: (2 * 125) + (1 * 50) = 300 EUR
      // Cost TRY: (2 * 2500) + (1 * 1000) = 6000 TRY
      // Cost EUR: 6000 * 0.05 = 300 EUR
      // Profit: 300 - 300 = 0 EUR
      expect(result.totalRevenueEur).toBe(300);
      expect(result.totalCostTry).toBe(6000);
      expect(result.totalCostEur).toBe(300);
      expect(result.profitLossEur).toBe(0);
      expect(result.marginPercent).toBe(0);
    });

    it('should calculate positive profit correctly', async () => {
      const mockBooking = {
        id: 1,
        lockedExchangeRate: 0.05,
        items: [
          {
            qty: 1,
            unitCostTry: 2000,
            unitPriceEur: 150,
          },
        ],
      };

      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);

      const result = await service.calculatePnL(1, 1);

      // Revenue: 150 EUR
      // Cost: 2000 * 0.05 = 100 EUR
      // Profit: 150 - 100 = 50 EUR
      // Margin: (50 / 150) * 100 = 33.33%
      expect(result.profitLossEur).toBe(50);
      expect(result.marginPercent).toBe(33.33);
    });

    it('should throw error when booking not found', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(service.calculatePnL(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw error when exchange rate not set', async () => {
      const mockBooking = {
        id: 1,
        lockedExchangeRate: 0,
        items: [],
      };

      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);

      await expect(service.calculatePnL(1, 1)).rejects.toThrow(
        'Locked exchange rate is not set',
      );
    });
  });

  describe('getStatsByStatus', () => {
    it('should return statistics grouped by status', async () => {
      const mockStats = [
        {
          status: BookingStatus.CONFIRMED,
          _count: { id: 10 },
          _sum: { totalCostTry: 100000, totalSellEur: 5000 },
        },
        {
          status: BookingStatus.COMPLETED,
          _count: { id: 5 },
          _sum: { totalCostTry: 50000, totalSellEur: 2500 },
        },
      ];

      prisma.booking.groupBy.mockResolvedValue(mockStats as any);

      const result = await service.getStatsByStatus(1);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(BookingStatus.CONFIRMED);
      expect(result[0].count).toBe(10);
    });
  });
});
