import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { QuoteRequestDto } from './dto/quote-request.dto';

@Injectable()
export class PricingService {
  constructor(private prisma: PrismaService) {}

  async getQuote(tenantId: number, dto: QuoteRequestDto) {
    // Fetch service offering with type-specific details
    const offering = await this.prisma.serviceOffering.findUnique({
      where: { id: dto.serviceOfferingId },
      include: {
        supplier: { include: { party: true } },
        hotelRoom: true,
        transfer: true,
        vehicle: true,
        guide: true,
        activity: true,
      },
    });

    if (!offering) {
      throw new NotFoundException('Service offering not found');
    }

    if (offering.tenantId !== tenantId) {
      throw new NotFoundException('Service offering not found');
    }

    const serviceDate = new Date(dto.serviceDate);

    // Route to appropriate pricing logic based on service type
    switch (offering.serviceType) {
      case 'HOTEL_ROOM':
        return this.calculateHotelQuote(tenantId, offering, serviceDate, dto);
      case 'TRANSFER':
        return this.calculateTransferQuote(tenantId, offering, serviceDate, dto);
      case 'VEHICLE_HIRE':
        return this.calculateVehicleQuote(tenantId, offering, serviceDate, dto);
      case 'GUIDE_SERVICE':
        return this.calculateGuideQuote(tenantId, offering, serviceDate, dto);
      case 'ACTIVITY':
        return this.calculateActivityQuote(tenantId, offering, serviceDate, dto);
      default:
        throw new BadRequestException('Unsupported service type');
    }
  }

  private async calculateHotelQuote(
    tenantId: number,
    offering: any,
    serviceDate: Date,
    dto: QuoteRequestDto,
  ) {
    const nights = dto.nights || 1;
    const rooms = Math.ceil((dto.pax || 2) / (offering.hotelRoom?.maxOccupancy || 2));

    // Find applicable rate
    const rate = await this.prisma.hotelRoomRate.findFirst({
      where: {
        tenantId,
        serviceOfferingId: offering.id,
        seasonFrom: { lte: serviceDate },
        seasonTo: { gte: serviceDate },
        isActive: true,
      },
      orderBy: { id: 'desc' },
    });

    if (!rate) {
      throw new NotFoundException('No active rate found for the selected date');
    }

    const baseCost = Number(rate.costTry) * nights * rooms;

    return {
      serviceOfferingId: offering.id,
      serviceType: offering.serviceType,
      serviceTitle: offering.title,
      supplier: offering.supplier.party.name,
      serviceDate: dto.serviceDate,
      details: {
        hotelName: offering.hotelRoom.hotelName,
        roomType: offering.hotelRoom.roomType,
        boardType: rate.boardType,
        nights,
        rooms,
        pax: dto.pax || 2,
      },
      pricing: {
        rateId: rate.id,
        pricingModel: rate.pricingModel,
        unitCostTry: Number(rate.costTry),
        quantity: nights * rooms,
        baseCostTry: baseCost,
        totalCostTry: baseCost,
      },
    };
  }

  private async calculateTransferQuote(
    tenantId: number,
    offering: any,
    serviceDate: Date,
    dto: QuoteRequestDto,
  ) {
    const rate = await this.prisma.transferRate.findFirst({
      where: {
        tenantId,
        serviceOfferingId: offering.id,
        seasonFrom: { lte: serviceDate },
        seasonTo: { gte: serviceDate },
        isActive: true,
      },
      orderBy: { id: 'desc' },
    });

    if (!rate) {
      throw new NotFoundException('No active rate found for the selected date');
    }

    let totalCost = Number(rate.baseCostTry);
    const breakdown: any = { baseCost: Number(rate.baseCostTry) };

    // Calculate extra kilometers
    if (dto.distance && rate.includedKm && dto.distance > Number(rate.includedKm)) {
      const extraKm = dto.distance - Number(rate.includedKm);
      const extraKmCost = extraKm * Number(rate.extraKmTry || 0);
      breakdown.extraKm = { km: extraKm, cost: extraKmCost };
      totalCost += extraKmCost;
    }

    // Calculate extra hours
    if (dto.hours && rate.includedHours && dto.hours > Number(rate.includedHours)) {
      const extraHours = dto.hours - Number(rate.includedHours);
      const extraHourCost = extraHours * Number(rate.extraHourTry || 0);
      breakdown.extraHours = { hours: extraHours, cost: extraHourCost };
      totalCost += extraHourCost;
    }

    return {
      serviceOfferingId: offering.id,
      serviceType: offering.serviceType,
      serviceTitle: offering.title,
      supplier: offering.supplier.party.name,
      serviceDate: dto.serviceDate,
      details: {
        originZone: offering.transfer.originZone,
        destZone: offering.transfer.destZone,
        transferType: offering.transfer.transferType,
        vehicleClass: offering.transfer.vehicleClass,
        distance: dto.distance,
        hours: dto.hours,
      },
      pricing: {
        rateId: rate.id,
        pricingModel: rate.pricingModel,
        baseCostTry: Number(rate.baseCostTry),
        breakdown,
        totalCostTry: totalCost,
      },
    };
  }

  private async calculateVehicleQuote(
    tenantId: number,
    offering: any,
    serviceDate: Date,
    dto: QuoteRequestDto,
  ) {
    const days = dto.days || 1;

    const rate = await this.prisma.vehicleRate.findFirst({
      where: {
        tenantId,
        serviceOfferingId: offering.id,
        seasonFrom: { lte: serviceDate },
        seasonTo: { gte: serviceDate },
        isActive: true,
      },
      orderBy: { id: 'desc' },
    });

    if (!rate) {
      throw new NotFoundException('No active rate found for the selected date');
    }

    let totalCost = Number(rate.baseCostTry) * days;
    const breakdown: any = { baseCost: Number(rate.baseCostTry), days };

    // Add driver cost if applicable
    if (offering.vehicle.withDriver && rate.driverDailyTry) {
      const driverCost = Number(rate.driverDailyTry) * days;
      breakdown.driver = { days, cost: driverCost };
      totalCost += driverCost;
    }

    return {
      serviceOfferingId: offering.id,
      serviceType: offering.serviceType,
      serviceTitle: offering.title,
      supplier: offering.supplier.party.name,
      serviceDate: dto.serviceDate,
      details: {
        make: offering.vehicle.make,
        model: offering.vehicle.model,
        vehicleClass: offering.vehicle.vehicleClass,
        withDriver: offering.vehicle.withDriver,
        days,
      },
      pricing: {
        rateId: rate.id,
        pricingModel: rate.pricingModel,
        breakdown,
        totalCostTry: totalCost,
      },
    };
  }

  private async calculateGuideQuote(
    tenantId: number,
    offering: any,
    serviceDate: Date,
    dto: QuoteRequestDto,
  ) {
    const rate = await this.prisma.guideRate.findFirst({
      where: {
        tenantId,
        serviceOfferingId: offering.id,
        seasonFrom: { lte: serviceDate },
        seasonTo: { gte: serviceDate },
        isActive: true,
      },
      orderBy: { id: 'desc' },
    });

    if (!rate) {
      throw new NotFoundException('No active rate found for the selected date');
    }

    let totalCost = 0;
    const breakdown: any = {};

    // Calculate based on pricing model
    if (rate.pricingModel === 'PER_DAY' && rate.dayCostTry) {
      const days = dto.days || 1;
      totalCost = Number(rate.dayCostTry) * days;
      breakdown.days = { quantity: days, unitCost: Number(rate.dayCostTry), cost: totalCost };
    } else if (rate.pricingModel === 'PER_HOUR' && rate.hourCostTry) {
      const hours = dto.hours || 8;
      totalCost = Number(rate.hourCostTry) * hours;
      breakdown.hours = { quantity: hours, unitCost: Number(rate.hourCostTry), cost: totalCost };
    }

    return {
      serviceOfferingId: offering.id,
      serviceType: offering.serviceType,
      serviceTitle: offering.title,
      supplier: offering.supplier.party.name,
      serviceDate: dto.serviceDate,
      details: {
        guideName: offering.guide.guideName,
        languages: offering.guide.languages,
        days: dto.days,
        hours: dto.hours,
      },
      pricing: {
        rateId: rate.id,
        pricingModel: rate.pricingModel,
        breakdown,
        totalCostTry: totalCost,
      },
    };
  }

  private async calculateActivityQuote(
    tenantId: number,
    offering: any,
    serviceDate: Date,
    dto: QuoteRequestDto,
  ) {
    const pax = dto.pax || 1;

    const rate = await this.prisma.activityRate.findFirst({
      where: {
        tenantId,
        serviceOfferingId: offering.id,
        seasonFrom: { lte: serviceDate },
        seasonTo: { gte: serviceDate },
        isActive: true,
      },
      orderBy: { id: 'desc' },
    });

    if (!rate) {
      throw new NotFoundException('No active rate found for the selected date');
    }

    let unitCost = Number(rate.baseCostTry);
    const breakdown: any = { baseCostPerPerson: unitCost };

    // Apply child discount if applicable
    if (dto.children && rate.childDiscountPct) {
      const childCost = unitCost * (1 - Number(rate.childDiscountPct) / 100);
      breakdown.children = {
        quantity: dto.children,
        unitCost: childCost,
        discount: Number(rate.childDiscountPct),
      };
    }

    const adults = pax - (dto.children || 0);
    const totalCost = adults * unitCost + (dto.children || 0) * (breakdown.children?.unitCost || unitCost);

    return {
      serviceOfferingId: offering.id,
      serviceType: offering.serviceType,
      serviceTitle: offering.title,
      supplier: offering.supplier.party.name,
      serviceDate: dto.serviceDate,
      details: {
        operatorName: offering.activity.operatorName,
        activityType: offering.activity.activityType,
        durationMinutes: offering.activity.durationMinutes,
        adults,
        children: dto.children || 0,
      },
      pricing: {
        rateId: rate.id,
        pricingModel: rate.pricingModel,
        breakdown,
        totalCostTry: totalCost,
      },
    };
  }
}
