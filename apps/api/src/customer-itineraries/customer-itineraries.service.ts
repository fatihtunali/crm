import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CatalogService } from '../catalog/catalog.service';
import { GenerateItineraryDto } from './dto/generate-itinerary.dto';
import { UpdateItineraryStatusDto } from './dto/update-itinerary-status.dto';
import { Decimal } from '@prisma/client/runtime/library';
import { v4 as uuidv4 } from 'uuid';

interface DayItinerary {
  dayNumber: number;
  date: string;
  city: string;
  hotel: any;
  tours: any[];
  transfers: any[];
  totalCost: number;
}

@Injectable()
export class CustomerItinerariesService {
  constructor(
    private prisma: PrismaService,
    private catalogService: CatalogService,
  ) {}

  /**
   * Generate a complete AI itinerary from customer preferences
   */
  async generateItinerary(generateDto: GenerateItineraryDto, tenantId: number) {
    // Calculate end date based on total nights
    const totalNights = generateDto.cityNights.reduce((sum, cn) => sum + cn.nights, 0);
    const startDate = new Date(generateDto.startDate);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + totalNights);

    // Generate day-by-day itinerary
    const itineraryData = await this.buildItinerary(generateDto, tenantId, startDate);

    // Calculate pricing
    const { totalPrice, pricePerPerson } = this.calculatePricing(
      itineraryData,
      generateDto.adults,
      generateDto.children || 0,
    );

    // Create customer itinerary record
    const itinerary = await this.prisma.customerItinerary.create({
      data: {
        uuid: uuidv4(),
        tenantId,
        customerName: generateDto.customerName,
        customerEmail: generateDto.customerEmail,
        customerPhone: generateDto.customerPhone,
        destination: generateDto.destination,
        cityNights: generateDto.cityNights as any,
        startDate,
        endDate,
        adults: generateDto.adults,
        children: generateDto.children || 0,
        hotelCategory: generateDto.hotelCategory,
        tourType: generateDto.tourType as any,
        specialRequests: generateDto.specialRequests,
        itineraryData: itineraryData as any,
        totalPrice: new Decimal(totalPrice),
        pricePerPerson: new Decimal(pricePerPerson),
        status: 'PENDING',
        source: 'ONLINE',
      },
    });

    return itinerary;
  }

  /**
   * Build day-by-day itinerary using catalog data
   */
  private async buildItinerary(
    generateDto: GenerateItineraryDto,
    tenantId: number,
    startDate: Date,
  ): Promise<DayItinerary[]> {
    const itinerary: DayItinerary[] = [];
    let currentDate = new Date(startDate);
    let dayNumber = 1;

    // Get city IDs
    const cities = await this.catalogService.getCities(tenantId, false);
    const cityMap = new Map(cities.map((c: any) => [c.name.toLowerCase(), c.id]));

    // Build itinerary for each city
    for (const cityNight of generateDto.cityNights) {
      const cityId = cityMap.get(cityNight.city.toLowerCase());

      if (!cityId) {
        console.warn(`City not found: ${cityNight.city}, skipping`);
        continue;
      }

      // For each night in this city
      for (let night = 0; night < cityNight.nights; night++) {
        const dayDate = new Date(currentDate);
        const nextDate = new Date(currentDate);
        nextDate.setDate(nextDate.getDate() + 1);

        // Get hotel for this city
        const hotels = await this.catalogService.getHotelsForCity({
          tenantId,
          cityId,
          category: generateDto.hotelCategory,
          startDate: dayDate,
          endDate: nextDate,
        });

        const selectedHotel = hotels.length > 0 ? hotels[0] : null;

        // Get tours for this day (1 tour per day)
        const tours = await this.catalogService.getToursForCity({
          tenantId,
          cityId,
          tourType: generateDto.tourType as any,
          startDate: dayDate,
          endDate: nextDate,
        });

        const selectedTours = tours.length > 0 ? [tours[0]] : [];

        // Get transfers (only on first day in city - arrival transfer)
        let transfers: any[] = [];
        if (night === 0 && dayNumber > 1) {
          // Get transfer from previous city
          const prevCityNight = generateDto.cityNights[generateDto.cityNights.indexOf(cityNight) - 1];
          if (prevCityNight) {
            const prevCityId = cityMap.get(prevCityNight.city.toLowerCase());
            if (prevCityId) {
              const availableTransfers = await this.catalogService.getTransfers({
                tenantId,
                fromCityId: prevCityId,
                toCityId: cityId,
                startDate: dayDate,
                endDate: nextDate,
              });

              if (availableTransfers.length > 0) {
                transfers = [availableTransfers[0]];
              }
            }
          }
        }

        // Calculate day cost
        const hotelCost = selectedHotel?.pricing?.ppDblRate
          ? Number(selectedHotel.pricing.ppDblRate)
          : 0;
        const tourCost = selectedTours.reduce((sum, tour) => {
          const pax = generateDto.adults + (generateDto.children || 0);
          return (
            sum +
            this.catalogService.calculatePriceForPax(
              tour.pricing,
              pax,
              generateDto.tourType as any || 'SIC',
            )
          );
        }, 0);
        const transferCost = transfers.reduce(
          (sum, transfer) => sum + (Number(transfer.priceOneway) || 0),
          0,
        );

        const totalCost = hotelCost + tourCost + transferCost;

        itinerary.push({
          dayNumber,
          date: dayDate.toISOString().split('T')[0],
          city: cityNight.city,
          hotel: selectedHotel
            ? {
                id: selectedHotel.id,
                name: selectedHotel.name,
                category: selectedHotel.category,
                rating: selectedHotel.rating,
                photoUrl: selectedHotel.photoUrl,
                pricing: selectedHotel.pricing,
              }
            : null,
          tours: selectedTours.map((tour) => ({
            id: tour.id,
            name: tour.name,
            description: tour.description,
            duration: tour.duration,
            tourType: tour.tourType,
            rating: tour.rating,
            photoUrl: tour.photoUrl,
            pricing: tour.pricing,
          })),
          transfers: transfers.map((transfer) => ({
            id: transfer.id,
            from: transfer.from,
            to: transfer.to,
            priceOneway: transfer.priceOneway,
            duration: transfer.duration,
            vehicle: transfer.vehicle,
          })),
          totalCost,
        });

        dayNumber++;
        currentDate.setDate(currentDate.getDate() + 1);
      }
    }

    return itinerary;
  }

  /**
   * Calculate total pricing for itinerary
   */
  private calculatePricing(
    itineraryData: DayItinerary[],
    adults: number,
    children: number,
  ): { totalPrice: number; pricePerPerson: number } {
    const totalPax = adults + children;
    let totalCost = 0;

    for (const day of itineraryData) {
      // Hotel cost (typically per room, but we'll multiply by number of rooms needed)
      const roomsNeeded = Math.ceil(totalPax / 2); // Assume 2 people per room
      const hotelCost = day.hotel?.pricing?.ppDblRate
        ? Number(day.hotel.pricing.ppDblRate) * roomsNeeded
        : 0;

      // Tour costs (per person)
      const tourCost = day.tours.reduce((sum, tour) => {
        return sum + (tour.pricing ? Number(tour.pricing.sicPrice2Pax || 0) : 0);
      }, 0);

      // Transfer costs (typically per vehicle)
      const transferCost = day.transfers.reduce(
        (sum, transfer) => sum + (Number(transfer.priceOneway) || 0),
        0,
      );

      totalCost += hotelCost + tourCost * totalPax + transferCost;
    }

    // Apply markup (15%) and tax (8%)
    const markup = 0.15;
    const tax = 0.08;
    const costWithMarkup = totalCost * (1 + markup);
    const totalPrice = costWithMarkup * (1 + tax);
    const pricePerPerson = totalPrice / totalPax;

    return {
      totalPrice: Math.round(totalPrice * 100) / 100,
      pricePerPerson: Math.round(pricePerPerson * 100) / 100,
    };
  }

  /**
   * Get all itineraries for tenant
   */
  async findAll(tenantId: number, page = 1, limit = 50, status?: string) {
    const skip = (page - 1) * limit;

    const where: any = { tenantId };
    if (status) {
      where.status = status;
    }

    const [itineraries, total] = await Promise.all([
      this.prisma.customerItinerary.findMany({
        where,
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.customerItinerary.count({ where }),
    ]);

    return {
      data: itineraries,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get itinerary by UUID (public access)
   */
  async findByUuid(uuid: string) {
    const itinerary = await this.prisma.customerItinerary.findUnique({
      where: { uuid },
    });

    if (!itinerary) {
      throw new NotFoundException(`Itinerary not found`);
    }

    return itinerary;
  }

  /**
   * Get itinerary by ID (agent access)
   */
  async findOne(id: number, tenantId: number) {
    const itinerary = await this.prisma.customerItinerary.findFirst({
      where: { id, tenantId },
    });

    if (!itinerary) {
      throw new NotFoundException(`Itinerary with ID ${id} not found`);
    }

    return itinerary;
  }

  /**
   * Update itinerary status
   */
  async updateStatus(uuid: string, statusDto: UpdateItineraryStatusDto, tenantId: number) {
    const itinerary = await this.prisma.customerItinerary.findFirst({
      where: { uuid, tenantId },
    });

    if (!itinerary) {
      throw new NotFoundException(`Itinerary not found`);
    }

    return this.prisma.customerItinerary.update({
      where: { id: itinerary.id },
      data: {
        status: statusDto.status as any,
        ...(statusDto.status === 'BOOKED' && {
          bookingRequestedAt: new Date(),
        }),
      },
    });
  }

  /**
   * Request booking (customer action)
   */
  async requestBooking(uuid: string) {
    const itinerary = await this.findByUuid(uuid);

    if (itinerary.status !== 'PENDING' && itinerary.status !== 'CONFIRMED') {
      throw new Error('Itinerary cannot be booked in current status');
    }

    return this.prisma.customerItinerary.update({
      where: { id: itinerary.id },
      data: {
        status: 'BOOKED',
        bookingRequestedAt: new Date(),
      },
    });
  }

  /**
   * Convert AI itinerary to manual quote for customization
   */
  async convertToManualQuote(id: number, tenantId: number) {
    const itinerary = await this.findOne(id, tenantId);

    // Extract days from itinerary data
    const itineraryDays = itinerary.itineraryData as any as DayItinerary[];

    // Create manual quote structure
    const manualQuoteData: any = {
      quoteName: itinerary.destination,
      category: 'B2C',
      startDate: itinerary.startDate,
      endDate: itinerary.endDate,
      tourType: itinerary.tourType || 'SIC',
      pax: itinerary.adults + itinerary.children,
      markup: 15.0,
      tax: 8.0,
      transportPricingMode: 'total',
      days: {
        create: itineraryDays.map((day) => ({
          dayNumber: day.dayNumber,
          date: new Date(day.date),
          expenses: {
            create: [
              // Add hotel expense
              ...(day.hotel
                ? [
                    {
                      category: 'hotelAccommodation',
                      hotelCategory: day.hotel.category,
                      location: day.city,
                      description: day.hotel.name,
                      price: new Decimal(day.hotel.pricing?.priceDouble || 0),
                    },
                  ]
                : []),
              // Add tour expenses
              ...day.tours.map((tour) => ({
                category: 'sicTourCost',
                location: day.city,
                description: tour.name,
                price: new Decimal(tour.pricing?.sicPrice2Pax || 0),
              })),
              // Add transfer expenses
              ...day.transfers.map((transfer) => ({
                category: 'transportation',
                location: `${transfer.from} to ${transfer.to}`,
                description: `Transfer from ${transfer.from} to ${transfer.to}`,
                price: new Decimal(transfer.priceOneway || 0),
              })),
            ],
          },
        })),
      },
    };

    // Create the manual quote
    const manualQuote = await this.prisma.manualQuote.create({
      data: {
        ...manualQuoteData,
        tenantId,
      },
      include: {
        days: {
          include: {
            expenses: true,
          },
        },
      },
    });

    return manualQuote;
  }
}
