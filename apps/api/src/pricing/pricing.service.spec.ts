import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { PrismaService } from '../prisma/prisma.service';

describe('PricingService', () => {
  let service: PricingService;
  let prisma: any;

  const mockPrismaService = {
    serviceOffering: {
      findUnique: jest.fn(),
    },
    hotelRoomRate: {
      findFirst: jest.fn(),
    },
    transferRate: {
      findFirst: jest.fn(),
    },
    vehicleRate: {
      findFirst: jest.fn(),
    },
    guideRate: {
      findFirst: jest.fn(),
    },
    activityRate: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PricingService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<PricingService>(PricingService);
    prisma = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('calculateHotelQuote', () => {
    const mockHotelOffering = {
      id: 1,
      tenantId: 1,
      serviceType: 'HOTEL_ROOM',
      title: 'Deluxe Room',
      supplier: {
        party: {
          name: 'Grand Hotel',
        },
      },
      hotelRoom: {
        hotelName: 'Grand Hotel',
        roomType: 'DELUXE',
        maxOccupancy: 4,
      },
    };

    const mockRate = {
      id: 1,
      seasonFrom: new Date('2024-01-01'),
      seasonTo: new Date('2024-12-31'),
      pricePerPersonDouble: 100,
      childPrice3to5: 50,
      boardType: 'BB',
      isActive: true,
    };

    it('should calculate correct price for 2 adults, 1 night, single room', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockHotelOffering as any);
      prisma.hotelRoomRate.findFirst.mockResolvedValue(mockRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 1,
        serviceDate: '2024-06-15',
        pax: 2,
        nights: 1,
      });

      expect(result.pricing.adultCostTry).toBe(200); // 2 adults * 100 * 1 night
      expect(result.pricing.childCostTry).toBe(0);
      expect(result.pricing.totalCostTry).toBe(200);
      expect(result.details.adults).toBe(2);
      expect(result.details.children).toBe(0);
      expect(result.details.nights).toBe(1);
    });

    it('should calculate correct price for 2 adults, 2 children, 3 nights, 2 rooms', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockHotelOffering as any);
      prisma.hotelRoomRate.findFirst.mockResolvedValue(mockRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 1,
        serviceDate: '2024-06-15',
        pax: 4,
        children: 2,
        nights: 3,
      });

      expect(result.pricing.adultCostTry).toBe(600); // 2 adults * 100 * 3 nights
      expect(result.pricing.childCostTry).toBe(300); // 2 children * 50 * 3 nights
      expect(result.pricing.totalCostTry).toBe(900);
      expect(result.details.adults).toBe(2);
      expect(result.details.children).toBe(2);
      expect(result.details.nights).toBe(3);
      expect(result.details.rooms).toBe(1); // Math.ceil(2 adults / 2)
    });

    it('should apply child discounts correctly', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockHotelOffering as any);
      prisma.hotelRoomRate.findFirst.mockResolvedValue(mockRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 1,
        serviceDate: '2024-06-15',
        pax: 3,
        children: 1,
        nights: 2,
      });

      // 2 adults * 100 * 2 nights = 400
      // 1 child * 50 * 2 nights = 100
      expect(result.pricing.adultCostTry).toBe(400);
      expect(result.pricing.childCostTry).toBe(100);
      expect(result.pricing.totalCostTry).toBe(500);
    });

    it('should throw error when no rate available', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockHotelOffering as any);
      prisma.hotelRoomRate.findFirst.mockResolvedValue(null);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 1,
          serviceDate: '2024-06-15',
          pax: 2,
          nights: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when capacity exceeded (new validation)', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockHotelOffering as any);
      prisma.hotelRoomRate.findFirst.mockResolvedValue(mockRate as any);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 1,
          serviceDate: '2024-06-15',
          pax: 5, // Exceeds maxOccupancy of 4
          nights: 1,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 1,
          serviceDate: '2024-06-15',
          pax: 5, // Exceeds maxOccupancy of 4
          nights: 1,
        }),
      ).rejects.toThrow('exceeds room maximum capacity');
    });

    it('should calculate per-person pricing correctly', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockHotelOffering as any);
      prisma.hotelRoomRate.findFirst.mockResolvedValue(mockRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 1,
        serviceDate: '2024-06-15',
        pax: 3,
        nights: 2,
      });

      expect(result.pricing.pricingModel).toBe('PER_PERSON_NIGHT');
      expect(result.pricing.pricePerPersonDouble).toBe(100);
    });

    it('should apply board type surcharges', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockHotelOffering as any);
      prisma.hotelRoomRate.findFirst.mockResolvedValue(mockRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 1,
        serviceDate: '2024-06-15',
        pax: 2,
        nights: 1,
      });

      expect(result.details.boardType).toBe('BB');
    });

    it('should throw error when service offering not found', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(null);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 999,
          serviceDate: '2024-06-15',
          pax: 2,
          nights: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('should throw error when tenantId mismatch', async () => {
      const wrongTenantOffering = { ...mockHotelOffering, tenantId: 2 };
      prisma.serviceOffering.findUnique.mockResolvedValue(wrongTenantOffering as any);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 1,
          serviceDate: '2024-06-15',
          pax: 2,
          nights: 1,
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('calculateTransferQuote', () => {
    const mockTransferOffering = {
      id: 2,
      tenantId: 1,
      serviceType: 'TRANSFER',
      title: 'Airport Transfer',
      supplier: {
        party: {
          name: 'Transfer Company',
        },
      },
      transfer: {
        originZone: 'Airport',
        destZone: 'Hotel',
        transferType: 'PRIVATE',
        vehicleClass: 'SEDAN',
        maxPassengers: 4,
      },
    };

    const mockZoneRate = {
      id: 1,
      pricingModel: 'ZONE_BASED',
      baseCostTry: 500,
      includedKm: null,
      includedHours: null,
      extraKmTry: null,
      extraHourTry: null,
      isActive: true,
    };

    const mockDistanceRate = {
      id: 2,
      pricingModel: 'DISTANCE_BASED',
      baseCostTry: 200,
      includedKm: 50,
      includedHours: 2,
      extraKmTry: 5,
      extraHourTry: 25,
      isActive: true,
    };

    it('should calculate correct price based on zone pricing', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockTransferOffering as any);
      prisma.transferRate.findFirst.mockResolvedValue(mockZoneRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 2,
        serviceDate: '2024-06-15',
        pax: 2,
      });

      expect(result.pricing.totalCostTry).toBe(500);
      expect(result.pricing.pricingModel).toBe('ZONE_BASED');
    });

    it('should calculate correct price based on distance/km pricing', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockTransferOffering as any);
      prisma.transferRate.findFirst.mockResolvedValue(mockDistanceRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 2,
        serviceDate: '2024-06-15',
        pax: 2,
        distance: 80, // 30 km over included
        hours: 3, // 1 hour over included
      });

      // Base: 200, Extra KM: 30 * 5 = 150, Extra Hours: 1 * 25 = 25
      expect(result.pricing.totalCostTry).toBe(375);
      expect(result.pricing.breakdown.extraKm.km).toBe(30);
      expect(result.pricing.breakdown.extraKm.cost).toBe(150);
      expect(result.pricing.breakdown.extraHours.hours).toBe(1);
      expect(result.pricing.breakdown.extraHours.cost).toBe(25);
    });

    it('should throw error when pax exceeds vehicle capacity', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockTransferOffering as any);
      prisma.transferRate.findFirst.mockResolvedValue(mockZoneRate as any);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 2,
          serviceDate: '2024-06-15',
          pax: 5, // Exceeds maxPassengers of 4
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 2,
          serviceDate: '2024-06-15',
          pax: 5,
        }),
      ).rejects.toThrow('exceeds transfer maximum capacity');
    });

    it('should handle round trip vs one-way correctly', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockTransferOffering as any);
      prisma.transferRate.findFirst.mockResolvedValue(mockZoneRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 2,
        serviceDate: '2024-06-15',
        pax: 2,
      });

      expect(result.pricing.baseCostTry).toBe(500);
    });
  });

  describe('calculateActivityQuote', () => {
    const mockActivityOffering = {
      id: 3,
      tenantId: 1,
      serviceType: 'ACTIVITY',
      title: 'Hot Air Balloon',
      supplier: {
        party: {
          name: 'Adventure Co',
        },
      },
      activity: {
        operatorName: 'Adventure Co',
        activityType: 'ADVENTURE',
        durationMinutes: 180,
        minParticipants: 2,
        maxParticipants: 10,
      },
    };

    const mockActivityRate = {
      id: 1,
      pricingModel: 'PER_PERSON',
      baseCostTry: 300,
      childDiscountPct: 25,
      isActive: true,
    };

    it('should calculate tiered pricing (adult, child, infant)', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockActivityOffering as any);
      prisma.activityRate.findFirst.mockResolvedValue(mockActivityRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 3,
        serviceDate: '2024-06-15',
        pax: 4,
        children: 2,
      });

      // Adults: 2 * 300 = 600
      // Children: 2 * 225 (25% discount) = 450
      expect(result.pricing.totalCostTry).toBe(1050);
      expect(result.details.adults).toBe(2);
      expect(result.details.children).toBe(2);
    });

    it('should validate min participants', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockActivityOffering as any);
      prisma.activityRate.findFirst.mockResolvedValue(mockActivityRate as any);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 3,
          serviceDate: '2024-06-15',
          pax: 1, // Below minParticipants of 2
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 3,
          serviceDate: '2024-06-15',
          pax: 1,
        }),
      ).rejects.toThrow('below minimum requirement');
    });

    it('should validate max participants', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockActivityOffering as any);
      prisma.activityRate.findFirst.mockResolvedValue(mockActivityRate as any);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 3,
          serviceDate: '2024-06-15',
          pax: 11, // Above maxParticipants of 10
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 3,
          serviceDate: '2024-06-15',
          pax: 11,
        }),
      ).rejects.toThrow('exceeds maximum capacity');
    });

    it('should apply group discounts correctly', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockActivityOffering as any);
      prisma.activityRate.findFirst.mockResolvedValue(mockActivityRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 3,
        serviceDate: '2024-06-15',
        pax: 5,
        children: 3,
      });

      // Adults: 2 * 300 = 600
      // Children with discount: 3 * 225 = 675
      expect(result.pricing.breakdown.children.discount).toBe(25);
      expect(result.pricing.totalCostTry).toBe(1275);
    });
  });

  describe('calculateVehicleQuote', () => {
    const mockVehicleOffering = {
      id: 4,
      tenantId: 1,
      serviceType: 'VEHICLE_HIRE',
      title: 'Mercedes Vito',
      supplier: {
        party: {
          name: 'Car Rental Co',
        },
      },
      vehicle: {
        make: 'Mercedes',
        model: 'Vito',
        vehicleClass: 'VAN',
        withDriver: true,
        maxPassengers: 8,
      },
    };

    const mockVehicleRate = {
      id: 1,
      dailyRateTry: 500,
      hourlyRateTry: 75,
      minHours: 4,
      driverDailyTry: 150,
      dailyKmIncluded: 200,
      extraKmTry: 2,
      isActive: true,
    };

    it('should calculate daily rate correctly', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockVehicleOffering as any);
      prisma.vehicleRate.findFirst.mockResolvedValue(mockVehicleRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 4,
        serviceDate: '2024-06-15',
        pax: 6,
        days: 3,
      });

      // Daily rate: 3 * 500 = 1500
      // Driver: 3 * 150 = 450
      expect(result.pricing.totalCostTry).toBe(1950);
      expect(result.pricing.pricingModel).toBe('DAILY');
    });

    it('should calculate with driver pricing', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockVehicleOffering as any);
      prisma.vehicleRate.findFirst.mockResolvedValue(mockVehicleRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 4,
        serviceDate: '2024-06-15',
        pax: 6,
        days: 2,
      });

      expect(result.pricing.breakdown.driver.days).toBe(2);
      expect(result.pricing.breakdown.driver.cost).toBe(300); // 2 * 150
    });

    it('should calculate without driver pricing', async () => {
      const vehicleWithoutDriver = {
        ...mockVehicleOffering,
        vehicle: { ...mockVehicleOffering.vehicle, withDriver: false },
      };
      prisma.serviceOffering.findUnique.mockResolvedValue(vehicleWithoutDriver as any);
      prisma.vehicleRate.findFirst.mockResolvedValue(mockVehicleRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 4,
        serviceDate: '2024-06-15',
        pax: 6,
        days: 2,
      });

      expect(result.pricing.breakdown.driver).toBeUndefined();
      expect(result.pricing.totalCostTry).toBe(1000); // 2 * 500, no driver cost
    });

    it('should validate capacity', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockVehicleOffering as any);
      prisma.vehicleRate.findFirst.mockResolvedValue(mockVehicleRate as any);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 4,
          serviceDate: '2024-06-15',
          pax: 9, // Exceeds maxPassengers of 8
          days: 1,
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 4,
          serviceDate: '2024-06-15',
          pax: 9,
          days: 1,
        }),
      ).rejects.toThrow('exceeds vehicle maximum capacity');
    });

    it('should handle hourly rate with minimum hours', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockVehicleOffering as any);
      prisma.vehicleRate.findFirst.mockResolvedValue(mockVehicleRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 4,
        serviceDate: '2024-06-15',
        pax: 6,
        hours: 3, // Below minHours of 4
      });

      // Should bill for 4 hours (minimum)
      expect(result.pricing.breakdown.hourlyRate.hours).toBe(4);
      expect(result.pricing.totalCostTry).toBe(300); // 4 * 75
      expect(result.pricing.breakdown.note).toContain('Minimum 4 hours');
    });

    it('should calculate extra kilometers correctly', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockVehicleOffering as any);
      prisma.vehicleRate.findFirst.mockResolvedValue(mockVehicleRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 4,
        serviceDate: '2024-06-15',
        pax: 6,
        days: 2,
        distance: 500, // 100 km over (2 * 200 included)
      });

      // Daily: 2 * 500 = 1000
      // Driver: 2 * 150 = 300
      // Extra KM: 100 * 2 = 200
      expect(result.pricing.breakdown.extraKm.km).toBe(100);
      expect(result.pricing.breakdown.extraKm.cost).toBe(200);
      expect(result.pricing.totalCostTry).toBe(1500);
    });
  });

  describe('calculateGuideQuote', () => {
    const mockGuideOffering = {
      id: 5,
      tenantId: 1,
      serviceType: 'GUIDE_SERVICE',
      title: 'English Guide',
      supplier: {
        party: {
          name: 'Guide Services',
        },
      },
      guide: {
        guideName: 'John Doe',
        languages: ['English', 'Turkish'],
      },
    };

    const mockDailyRate = {
      id: 1,
      pricingModel: 'PER_DAY',
      dayCostTry: 800,
      hourCostTry: null,
      isActive: true,
    };

    const mockHourlyRate = {
      id: 2,
      pricingModel: 'PER_HOUR',
      dayCostTry: null,
      hourCostTry: 100,
      isActive: true,
    };

    it('should calculate hourly rate correctly', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockGuideOffering as any);
      prisma.guideRate.findFirst.mockResolvedValue(mockHourlyRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 5,
        serviceDate: '2024-06-15',
        hours: 6,
      });

      expect(result.pricing.pricingModel).toBe('PER_HOUR');
      expect(result.pricing.totalCostTry).toBe(600); // 6 * 100
    });

    it('should calculate daily rate correctly', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockGuideOffering as any);
      prisma.guideRate.findFirst.mockResolvedValue(mockDailyRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 5,
        serviceDate: '2024-06-15',
        days: 5,
      });

      expect(result.pricing.pricingModel).toBe('PER_DAY');
      expect(result.pricing.totalCostTry).toBe(4000); // 5 * 800
    });

    it('should validate language skill', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockGuideOffering as any);
      prisma.guideRate.findFirst.mockResolvedValue(mockDailyRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 5,
        serviceDate: '2024-06-15',
        days: 3,
      });

      expect(result.details.languages).toContain('English');
      expect(result.details.languages).toContain('Turkish');
    });

    it('should calculate total for multi-day bookings', async () => {
      prisma.serviceOffering.findUnique.mockResolvedValue(mockGuideOffering as any);
      prisma.guideRate.findFirst.mockResolvedValue(mockDailyRate as any);

      const result = await service.getQuote(1, {
        serviceOfferingId: 5,
        serviceDate: '2024-06-15',
        days: 7,
      });

      expect(result.pricing.totalCostTry).toBe(5600); // 7 * 800
      expect(result.pricing.breakdown.days.quantity).toBe(7);
    });
  });

  describe('getQuote - general validation', () => {
    it('should throw error for unsupported service type', async () => {
      const mockUnsupportedOffering = {
        id: 99,
        tenantId: 1,
        serviceType: 'UNSUPPORTED_TYPE',
        title: 'Unknown Service',
        supplier: {
          party: {
            name: 'Unknown',
          },
        },
      };

      prisma.serviceOffering.findUnique.mockResolvedValue(mockUnsupportedOffering as any);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 99,
          serviceDate: '2024-06-15',
        }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.getQuote(1, {
          serviceOfferingId: 99,
          serviceDate: '2024-06-15',
        }),
      ).rejects.toThrow('Unsupported service type');
    });
  });
});
