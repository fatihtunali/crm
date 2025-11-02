import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { PrismaService } from '../prisma/prisma.service';
import { QuotationStatus } from '@tour-crm/shared';

describe('QuotationsService', () => {
  let service: QuotationsService;
  let prisma: any;

  const mockPrismaService = {
    quotation: {
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
    booking: {
      create: jest.fn(),
      count: jest.fn(),
    },
    bookingItem: {
      createMany: jest.fn(),
    },
    $transaction: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuotationsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<QuotationsService>(QuotationsService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('acceptQuotation', () => {
    const mockQuotation = {
      id: 1,
      tenantId: 1,
      status: QuotationStatus.SENT,
      calcCostTry: 10000,
      sellPriceEur: 500,
      customJson: {
        items: [
          {
            itemType: 'HOTEL',
            qty: 2,
            unitCostTry: 2500,
            unitPriceEur: 125,
          },
        ],
      },
      lead: {
        client: {
          id: 10,
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
      tour: {
        id: 5,
        code: 'TR001',
        name: 'Turkey Tour',
      },
      bookings: [],
    };

    const mockExchangeRate = {
      id: 1,
      rate: 0.05,
      fromCurrency: 'TRY',
      toCurrency: 'EUR',
      rateDate: new Date('2024-06-01'),
    };

    it('should create booking with locked exchange rate', async () => {
      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);
      prisma.exchangeRate.findFirst.mockResolvedValue(mockExchangeRate as any);

      const mockBooking = {
        id: 1,
        bookingCode: 'BK-2024-0001',
        lockedExchangeRate: 0.05,
        totalCostTry: 10000,
        totalSellEur: 500,
      };

      const mockUpdatedQuotation = {
        ...mockQuotation,
        status: QuotationStatus.ACCEPTED,
        bookings: [mockBooking],
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          booking: {
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn().mockResolvedValue(mockBooking),
          },
          bookingItem: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          quotation: {
            update: jest.fn().mockResolvedValue(mockUpdatedQuotation),
          },
        };
        return callback(tx);
      });

      const result = await service.acceptQuotation(1, 1);

      expect(result.status).toBe(QuotationStatus.ACCEPTED);
      expect(result.booking.lockedExchangeRate).toBe(0.05);
    });

    it('should transition status to ACCEPTED', async () => {
      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);
      prisma.exchangeRate.findFirst.mockResolvedValue(mockExchangeRate as any);

      const mockUpdatedQuotation = {
        ...mockQuotation,
        status: QuotationStatus.ACCEPTED,
      };

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          booking: {
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn().mockResolvedValue({ id: 1 }),
          },
          bookingItem: {
            createMany: jest.fn().mockResolvedValue({ count: 1 }),
          },
          quotation: {
            update: jest.fn().mockResolvedValue(mockUpdatedQuotation),
          },
        };
        return callback(tx);
      });

      const result = await service.acceptQuotation(1, 1);

      expect(result.status).toBe(QuotationStatus.ACCEPTED);
    });

    it('should throw error if already accepted (NEW)', async () => {
      const alreadyAccepted = {
        ...mockQuotation,
        status: QuotationStatus.ACCEPTED,
      };

      prisma.quotation.findFirst.mockResolvedValue(alreadyAccepted as any);

      await expect(service.acceptQuotation(1, 1)).rejects.toThrow(
        ConflictException,
      );

      await expect(service.acceptQuotation(1, 1)).rejects.toThrow(
        'already been accepted',
      );
    });

    it('should throw error if booking exists (NEW)', async () => {
      const quotationWithBooking = {
        ...mockQuotation,
        bookings: [{ id: 1, bookingCode: 'BK-2024-0001' }],
      };

      prisma.quotation.findFirst.mockResolvedValue(quotationWithBooking as any);

      await expect(service.acceptQuotation(1, 1)).rejects.toThrow(
        ConflictException,
      );

      await expect(service.acceptQuotation(1, 1)).rejects.toThrow(
        'already exists for this quotation',
      );
    });

    it('should validate exchange rate exists (NEW)', async () => {
      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);
      prisma.exchangeRate.findFirst.mockResolvedValue(null);

      await expect(service.acceptQuotation(1, 1)).rejects.toThrow(
        'No exchange rate found',
      );
    });

    it('should only accept quotations in SENT status', async () => {
      const draftQuotation = {
        ...mockQuotation,
        status: QuotationStatus.DRAFT,
      };

      prisma.quotation.findFirst.mockResolvedValue(draftQuotation as any);

      await expect(service.acceptQuotation(1, 1)).rejects.toThrow(
        BadRequestException,
      );

      await expect(service.acceptQuotation(1, 1)).rejects.toThrow(
        'Only SENT quotations can be accepted',
      );
    });

    it('should create booking items from quotation items', async () => {
      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);
      prisma.exchangeRate.findFirst.mockResolvedValue(mockExchangeRate as any);

      let createManyCalled = false;

      prisma.$transaction.mockImplementation(async (callback: any) => {
        const tx = {
          booking: {
            count: jest.fn().mockResolvedValue(0),
            create: jest.fn().mockResolvedValue({ id: 1 }),
          },
          bookingItem: {
            createMany: jest.fn().mockImplementation((args) => {
              createManyCalled = true;
              expect(args.data).toHaveLength(1);
              expect(args.data[0].itemType).toBe('HOTEL');
              return { count: 1 };
            }),
          },
          quotation: {
            update: jest.fn().mockResolvedValue(mockQuotation),
          },
        };
        return callback(tx);
      });

      await service.acceptQuotation(1, 1);

      expect(createManyCalled).toBe(true);
    });

    it('should throw error when quotation not found', async () => {
      prisma.quotation.findFirst.mockResolvedValue(null);

      await expect(service.acceptQuotation(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('sendQuotation', () => {
    const mockQuotation = {
      id: 1,
      tenantId: 1,
      status: QuotationStatus.DRAFT,
      lead: {
        client: {
          name: 'John Doe',
          email: 'john@example.com',
        },
      },
    };

    it('should transition DRAFT to SENT', async () => {
      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);

      const updatedQuotation = {
        ...mockQuotation,
        status: QuotationStatus.SENT,
      };

      prisma.quotation.update.mockResolvedValue(updatedQuotation as any);

      const result = await service.sendQuotation(1, 1);

      expect(result.status).toBe(QuotationStatus.SENT);
      expect(result.message).toContain('sent successfully');
    });

    it('should validate client email exists', async () => {
      const quotationWithoutEmail = {
        ...mockQuotation,
        lead: {
          client: {
            name: 'John Doe',
            email: null,
          },
        },
      };

      prisma.quotation.findFirst.mockResolvedValue(quotationWithoutEmail as any);

      await expect(service.sendQuotation(1, 1)).rejects.toThrow(
        'No email address found',
      );
    });

    it('should only send quotations in DRAFT status', async () => {
      const sentQuotation = {
        ...mockQuotation,
        status: QuotationStatus.SENT,
      };

      prisma.quotation.findFirst.mockResolvedValue(sentQuotation as any);

      await expect(service.sendQuotation(1, 1)).rejects.toThrow(
        'Only DRAFT quotations can be sent',
      );
    });

    it('should create notification/email stub', async () => {
      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);

      const updatedQuotation = {
        ...mockQuotation,
        status: QuotationStatus.SENT,
      };

      prisma.quotation.update.mockResolvedValue(updatedQuotation as any);

      const result = await service.sendQuotation(1, 1);

      expect(result.message).toContain(mockQuotation.lead.client.email);
    });
  });

  describe('rejectQuotation', () => {
    const mockQuotation = {
      id: 1,
      tenantId: 1,
      status: QuotationStatus.SENT,
    };

    it('should transition to REJECTED', async () => {
      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);

      const rejectedQuotation = {
        ...mockQuotation,
        status: QuotationStatus.REJECTED,
      };

      prisma.quotation.update.mockResolvedValue(rejectedQuotation as any);

      const result = await service.rejectQuotation(1, 1);

      expect(result.status).toBe(QuotationStatus.REJECTED);
      expect(result.message).toBe('Quotation rejected.');
    });

    it('should only reject quotations in SENT status', async () => {
      const draftQuotation = {
        ...mockQuotation,
        status: QuotationStatus.DRAFT,
      };

      prisma.quotation.findFirst.mockResolvedValue(draftQuotation as any);

      await expect(service.rejectQuotation(1, 1)).rejects.toThrow(
        'Only SENT quotations can be rejected',
      );
    });

    it('cannot be re-accepted after rejection', async () => {
      const rejectedQuotation = {
        ...mockQuotation,
        status: QuotationStatus.REJECTED,
      };

      prisma.quotation.findFirst.mockResolvedValue(rejectedQuotation as any);

      // Trying to accept a rejected quotation
      await expect(service.acceptQuotation(1, 1)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw error when quotation not found', async () => {
      prisma.quotation.findFirst.mockResolvedValue(null);

      await expect(service.rejectQuotation(999, 1)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    const createDto = {
      leadId: 1,
      tourId: 5,
      customJson: {},
      calcCostTry: 10000,
      sellPriceEur: 500,
      exchangeRateUsed: 0.05,
      validUntil: new Date('2024-12-31'),
    };

    it('should create quotation with valid data', async () => {
      const mockQuotation = {
        id: 1,
        tenantId: 1,
        ...createDto,
        status: QuotationStatus.DRAFT,
      };

      prisma.quotation.create.mockResolvedValue(mockQuotation as any);

      const result = await service.create(createDto, 1);

      expect(result.status).toBe(QuotationStatus.DRAFT);
      expect(result.leadId).toBe(1);
      expect(result.tourId).toBe(5);
    });

    it('should default status to DRAFT if not provided', async () => {
      const mockQuotation = {
        id: 1,
        tenantId: 1,
        ...createDto,
        status: QuotationStatus.DRAFT,
      };

      prisma.quotation.create.mockResolvedValue(mockQuotation as any);

      const result = await service.create(createDto, 1);

      expect(result.status).toBe(QuotationStatus.DRAFT);
    });
  });

  describe('findOne', () => {
    it('should return quotation with related data', async () => {
      const mockQuotation = {
        id: 1,
        tenantId: 1,
        lead: {
          id: 1,
          source: 'WEBSITE',
        },
        tour: {
          id: 5,
          code: 'TR001',
          name: 'Turkey Tour',
          itineraries: [
            { dayNumber: 1, description: 'Day 1' },
            { dayNumber: 2, description: 'Day 2' },
          ],
        },
        bookings: [],
      };

      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);

      const result = await service.findOne(1, 1);

      expect(result.tour.itineraries).toHaveLength(2);
      expect(result.lead).toBeDefined();
    });

    it('should throw error when quotation not found', async () => {
      prisma.quotation.findFirst.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should respect tenant isolation', async () => {
      prisma.quotation.findFirst.mockResolvedValue(null);

      await service.findOne(1, 2).catch(() => {});

      expect(prisma.quotation.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 1, tenantId: 2 },
        }),
      );
    });
  });

  describe('update', () => {
    it('should update quotation successfully', async () => {
      const existingQuotation = {
        id: 1,
        tenantId: 1,
        status: QuotationStatus.DRAFT,
      };

      prisma.quotation.findFirst.mockResolvedValue(existingQuotation as any);

      const updatedQuotation = {
        ...existingQuotation,
        sellPriceEur: 600,
      };

      prisma.quotation.update.mockResolvedValue(updatedQuotation as any);

      const result = await service.update(1, { sellPriceEur: 600 }, 1);

      expect(result.sellPriceEur).toBe(600);
    });

    it('should throw error when quotation not found', async () => {
      prisma.quotation.findFirst.mockResolvedValue(null);

      await expect(
        service.update(999, { sellPriceEur: 600 }, 1),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete quotation successfully', async () => {
      const mockQuotation = {
        id: 1,
        tenantId: 1,
      };

      prisma.quotation.findFirst.mockResolvedValue(mockQuotation as any);
      prisma.quotation.delete.mockResolvedValue(mockQuotation as any);

      const result = await service.remove(1, 1);

      expect(result.message).toBe('Quotation deleted successfully');
    });

    it('should throw error when quotation not found', async () => {
      prisma.quotation.findFirst.mockResolvedValue(null);

      await expect(service.remove(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return paginated quotations', async () => {
      const mockQuotations = [
        { id: 1, status: QuotationStatus.DRAFT },
        { id: 2, status: QuotationStatus.SENT },
      ];

      prisma.quotation.findMany.mockResolvedValue(mockQuotations as any);
      prisma.quotation.count.mockResolvedValue(2);

      const result = await service.findAll(1, { page: 1, limit: 10 });

      expect(result.data).toHaveLength(2);
      expect(result.total).toBe(2);
    });

    it('should filter by status', async () => {
      const mockQuotations = [{ id: 1, status: QuotationStatus.SENT }];

      prisma.quotation.findMany.mockResolvedValue(mockQuotations as any);
      prisma.quotation.count.mockResolvedValue(1);

      await service.findAll(1, { page: 1, limit: 10 }, QuotationStatus.SENT);

      expect(prisma.quotation.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: QuotationStatus.SENT,
          }),
        }),
      );
    });
  });

  describe('getStatsByStatus', () => {
    it('should return statistics grouped by status', async () => {
      const mockStats = [
        {
          status: QuotationStatus.DRAFT,
          _count: { id: 5 },
          _sum: { calcCostTry: 50000, sellPriceEur: 2500 },
        },
        {
          status: QuotationStatus.SENT,
          _count: { id: 3 },
          _sum: { calcCostTry: 30000, sellPriceEur: 1500 },
        },
      ];

      prisma.quotation.groupBy.mockResolvedValue(mockStats as any);

      const result = await service.getStatsByStatus(1);

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe(QuotationStatus.DRAFT);
      expect(result[0].count).toBe(5);
    });
  });
});
