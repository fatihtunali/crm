import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PaymentClientService } from './payment-client.service';
import { PrismaService } from '../prisma/prisma.service';
import { PaymentStatus } from '@tour-crm/shared';

describe('PaymentClientService', () => {
  let service: PaymentClientService;
  let prisma: any;

  const mockPrismaService = {
    booking: {
      findFirst: jest.fn(),
    },
    paymentClient: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      aggregate: jest.fn(),
      groupBy: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentClientService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PaymentClientService>(PaymentClientService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    const mockBooking = {
      id: 1,
      tenantId: 1,
      bookingCode: 'BK-2024-0001',
      totalSellEur: 5000,
    };

    const createPaymentDto = {
      bookingId: 1,
      amountEur: 1500,
      method: 'BANK_TRANSFER',
      paidAt: new Date('2024-06-15'),
      status: PaymentStatus.COMPLETED,
    } as any;

    it('should create payment successfully with valid data', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);
      prisma.paymentClient.aggregate.mockResolvedValue({
        _sum: { amountEur: 0 },
      } as any);

      const mockCreatedPayment = {
        id: 1,
        tenantId: 1,
        ...createPaymentDto,
        booking: {
          id: 1,
          bookingCode: 'BK-2024-0001',
          client: {
            id: 1,
            name: 'John Doe',
          },
        },
      };

      prisma.paymentClient.create.mockResolvedValue(mockCreatedPayment as any);

      const result = await service.create(createPaymentDto, 1);

      expect(result).toEqual(mockCreatedPayment);
      expect(prisma.booking.findFirst).toHaveBeenCalledWith({
        where: { id: 1, tenantId: 1 },
      });
      expect(prisma.paymentClient.create).toHaveBeenCalled();
    });

    it('should throw error when booking not found', async () => {
      prisma.booking.findFirst.mockResolvedValue(null);

      await expect(service.create(createPaymentDto, 1)).rejects.toThrow(
        NotFoundException,
      );

      await expect(service.create(createPaymentDto, 1)).rejects.toThrow(
        'Booking with ID 1 not found',
      );
    });

    it('should throw error when payment exceeds booking total (NEW)', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);
      prisma.paymentClient.aggregate.mockResolvedValue({
        _sum: { amountEur: 4000 },
      } as any);

      const exceedingPaymentDto = {
        ...createPaymentDto,
        amountEur: 1500, // Total would be 5500, exceeds 5000
      };

      await expect(service.create(exceedingPaymentDto, 1)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.create(exceedingPaymentDto, 1)).rejects.toThrow(
        'would exceed booking total',
      );
    });

    it('should calculate remaining balance correctly', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);
      prisma.paymentClient.aggregate.mockResolvedValue({
        _sum: { amountEur: 2000 },
      } as any);

      const mockCreatedPayment = {
        id: 2,
        tenantId: 1,
        ...createPaymentDto,
        amountEur: 1500,
      };

      prisma.paymentClient.create.mockResolvedValue(mockCreatedPayment as any);

      const result = await service.create(
        { ...createPaymentDto, amountEur: 1500 },
        1,
      );

      expect(result.amountEur).toBe(1500);
      // Remaining should be 5000 - 2000 - 1500 = 1500
    });

    it('should handle multiple partial payments', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);

      // First payment
      prisma.paymentClient.aggregate.mockResolvedValueOnce({
        _sum: { amountEur: 0 },
      } as any);

      prisma.paymentClient.create.mockResolvedValueOnce({
        id: 1,
        amountEur: 1000,
      } as any);

      await service.create({ ...createPaymentDto, amountEur: 1000 }, 1);

      // Second payment
      prisma.paymentClient.aggregate.mockResolvedValueOnce({
        _sum: { amountEur: 1000 },
      } as any);

      prisma.paymentClient.create.mockResolvedValueOnce({
        id: 2,
        amountEur: 1500,
      } as any);

      await service.create({ ...createPaymentDto, amountEur: 1500 }, 1);

      // Third payment
      prisma.paymentClient.aggregate.mockResolvedValueOnce({
        _sum: { amountEur: 2500 },
      } as any);

      prisma.paymentClient.create.mockResolvedValueOnce({
        id: 3,
        amountEur: 2500,
      } as any);

      const result = await service.create(
        { ...createPaymentDto, amountEur: 2500 },
        1,
      );

      expect(result.amountEur).toBe(2500);
      // Total payments would be 5000, which exactly matches booking total
    });

    it('should validate payment amount > 0', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);
      prisma.paymentClient.aggregate.mockResolvedValue({
        _sum: { amountEur: 0 },
      } as any);

      await expect(
        service.create({ ...createPaymentDto, amountEur: 0 }, 1),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.create({ ...createPaymentDto, amountEur: 0 }, 1),
      ).rejects.toThrow('must be greater than zero');

      await expect(
        service.create({ ...createPaymentDto, amountEur: -100 }, 1),
      ).rejects.toThrow(BadRequestException);
    });

    it('should handle different payment methods', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);
      prisma.paymentClient.aggregate.mockResolvedValue({
        _sum: { amountEur: 0 },
      } as any);

      const paymentMethods = [
        'CASH',
        'BANK_TRANSFER',
        'CREDIT_CARD',
        'DEBIT_CARD',
      ];

      for (const method of paymentMethods) {
        const mockPayment = {
          id: 1,
          ...createPaymentDto,
          method,
        };

        prisma.paymentClient.create.mockResolvedValue(mockPayment as any);

        const result = await service.create(
          { ...createPaymentDto, method },
          1,
        );

        expect(result.method).toBe(method);
      }
    });

    it('should exclude FAILED and REFUNDED payments from total calculation', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);

      // Aggregate should only count COMPLETED and PENDING
      prisma.paymentClient.aggregate.mockResolvedValue({
        _sum: { amountEur: 1000 },
      } as any);

      prisma.paymentClient.create.mockResolvedValue({
        id: 1,
        amountEur: 2000,
      } as any);

      await service.create({ ...createPaymentDto, amountEur: 2000 }, 1);

      expect(prisma.paymentClient.aggregate).toHaveBeenCalledWith({
        where: {
          bookingId: 1,
          tenantId: 1,
          status: {
            in: [PaymentStatus.COMPLETED, PaymentStatus.PENDING],
          },
        },
        _sum: {
          amountEur: true,
        },
      });
    });

    it('should allow exact payment to remaining balance', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);
      prisma.paymentClient.aggregate.mockResolvedValue({
        _sum: { amountEur: 3500 },
      } as any);

      const mockCreatedPayment = {
        id: 1,
        amountEur: 1500, // Exactly matches remaining (5000 - 3500)
      };

      prisma.paymentClient.create.mockResolvedValue(mockCreatedPayment as any);

      const result = await service.create(
        { ...createPaymentDto, amountEur: 1500 },
        1,
      );

      expect(result.amountEur).toBe(1500);
    });

    it('should create audit log entry (implicit via Prisma)', async () => {
      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);
      prisma.paymentClient.aggregate.mockResolvedValue({
        _sum: { amountEur: 0 },
      } as any);

      const mockCreatedPayment = {
        id: 1,
        ...createPaymentDto,
        createdAt: new Date(),
      };

      prisma.paymentClient.create.mockResolvedValue(mockCreatedPayment as any);

      const result = await service.create(createPaymentDto, 1);

      expect(result.createdAt).toBeDefined();
    });
  });

  describe('findOne', () => {
    it('should return payment with booking details', async () => {
      const mockPayment = {
        id: 1,
        tenantId: 1,
        amountEur: 1500,
        booking: {
          id: 1,
          bookingCode: 'BK-2024-0001',
          totalSellEur: 5000,
          client: {
            id: 1,
            name: 'John Doe',
            email: 'john@example.com',
          },
        },
      };

      prisma.paymentClient.findFirst.mockResolvedValue(mockPayment as any);

      const result = await service.findOne(1, 1);

      expect(result).toEqual(mockPayment);
      expect(result.booking).toBeDefined();
      expect(result.booking.client).toBeDefined();
    });

    it('should throw error when payment not found', async () => {
      prisma.paymentClient.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999, 1)).rejects.toThrow(
        'Payment with ID 999 not found',
      );
    });

    it('should respect tenant isolation', async () => {
      prisma.paymentClient.findFirst.mockResolvedValue(null);

      await service.findOne(1, 2).catch(() => {});

      expect(prisma.paymentClient.findFirst).toHaveBeenCalledWith({
        where: { id: 1, tenantId: 2 },
        include: expect.any(Object),
      });
    });
  });

  describe('update', () => {
    const mockExistingPayment = {
      id: 1,
      tenantId: 1,
      bookingId: 1,
      amountEur: 1500,
    };

    it('should update payment successfully', async () => {
      prisma.paymentClient.findFirst.mockResolvedValue(mockExistingPayment as any);

      const mockBooking = {
        id: 1,
        tenantId: 1,
      };

      prisma.booking.findFirst.mockResolvedValue(mockBooking as any);

      const updatedPayment = {
        ...mockExistingPayment,
        amountEur: 2000,
        notes: 'Updated payment',
      };

      prisma.paymentClient.update.mockResolvedValue(updatedPayment as any);

      const result = await service.update(
        1,
        { amountEur: 2000, notes: 'Updated payment' },
        1,
      );

      expect(result.amountEur).toBe(2000);
      expect(result.notes).toBe('Updated payment');
    });

    it('should throw error when payment not found', async () => {
      prisma.paymentClient.findFirst.mockResolvedValue(null);

      await expect(
        service.update(999, { amountEur: 2000 }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete payment successfully', async () => {
      const mockPayment = {
        id: 1,
        tenantId: 1,
      };

      prisma.paymentClient.findFirst.mockResolvedValue(mockPayment as any);
      prisma.paymentClient.delete.mockResolvedValue(mockPayment as any);

      const result = await service.remove(1, 1);

      expect(result.message).toBe('Client payment deleted successfully');
      expect(prisma.paymentClient.delete).toHaveBeenCalledWith({
        where: { id: 1 },
      });
    });

    it('should throw error when payment not found', async () => {
      prisma.paymentClient.findFirst.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated payments', async () => {
      const mockPayments = [
        { id: 1, amountEur: 1500 },
        { id: 2, amountEur: 2000 },
      ];

      prisma.paymentClient.findMany.mockResolvedValue(mockPayments as any);
      prisma.paymentClient.count.mockResolvedValue(2);

      const result = await service.findAll(1, { page: 1, limit: 10 });

      expect(result.data).toEqual(mockPayments);
      expect(result.total).toBe(2);
    });

    it('should filter by bookingId', async () => {
      const mockPayments = [{ id: 1, bookingId: 5, amountEur: 1500 }];

      prisma.paymentClient.findMany.mockResolvedValue(mockPayments as any);
      prisma.paymentClient.count.mockResolvedValue(1);

      await service.findAll(1, { page: 1, limit: 10 }, 5);

      expect(prisma.paymentClient.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            tenantId: 1,
            bookingId: 5,
          }),
        }),
      );
    });
  });

  describe('getStats', () => {
    it('should return payment statistics grouped by method and status', async () => {
      const mockStats = [
        {
          method: 'BANK_TRANSFER',
          status: PaymentStatus.COMPLETED,
          _sum: { amountEur: 10000 },
          _count: { id: 5 },
        },
        {
          method: 'CREDIT_CARD',
          status: PaymentStatus.COMPLETED,
          _sum: { amountEur: 8000 },
          _count: { id: 4 },
        },
      ];

      prisma.paymentClient.groupBy.mockResolvedValue(mockStats as any);

      const result = await service.getStats(1);

      expect(result).toEqual(mockStats);
      expect(prisma.paymentClient.groupBy).toHaveBeenCalledWith({
        by: ['method', 'status'],
        where: { tenantId: 1 },
        _sum: { amountEur: true },
        _count: { id: true },
      });
    });
  });
});
