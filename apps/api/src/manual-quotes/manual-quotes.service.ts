import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateManualQuoteDto } from './dto/create-manual-quote.dto';
import { UpdateManualQuoteDto } from './dto/update-manual-quote.dto';
import { CreateManualQuoteDayDto } from './dto/create-manual-quote-day.dto';
import { CreateManualQuoteExpenseDto } from './dto/create-manual-quote-expense.dto';
import { Decimal } from '@prisma/client/runtime/library';

@Injectable()
export class ManualQuotesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new manual quote with days and expenses
   */
  async create(createDto: CreateManualQuoteDto, tenantId: number) {
    const { days, ...quoteData } = createDto;

    const quote = await this.prisma.manualQuote.create({
      data: {
        ...quoteData,
        tenantId,
        startDate: new Date(quoteData.startDate),
        endDate: new Date(quoteData.endDate),
        validFrom: quoteData.validFrom ? new Date(quoteData.validFrom) : null,
        validTo: quoteData.validTo ? new Date(quoteData.validTo) : null,
        markup: new Decimal(quoteData.markup),
        tax: new Decimal(quoteData.tax),
        days: days
          ? {
              create: days.map((day) => ({
                dayNumber: day.dayNumber,
                date: new Date(day.date),
                expenses: day.expenses
                  ? {
                      create: day.expenses.map((expense) => ({
                        category: expense.category,
                        hotelCategory: expense.hotelCategory,
                        location: expense.location,
                        description: expense.description,
                        price: new Decimal(expense.price),
                        singleSupplement: expense.singleSupplement
                          ? new Decimal(expense.singleSupplement)
                          : null,
                        child0to2: expense.child0to2 ? new Decimal(expense.child0to2) : null,
                        child3to5: expense.child3to5 ? new Decimal(expense.child3to5) : null,
                        child6to11: expense.child6to11 ? new Decimal(expense.child6to11) : null,
                        vehicleCount: expense.vehicleCount,
                        pricePerVehicle: expense.pricePerVehicle
                          ? new Decimal(expense.pricePerVehicle)
                          : null,
                      })),
                    }
                  : undefined,
              })),
            }
          : undefined,
      },
      include: {
        days: {
          include: {
            expenses: true,
          },
          orderBy: {
            dayNumber: 'asc',
          },
        },
      },
    });

    // Calculate pricing table
    const pricingTable = await this.calculatePricing(quote.id, tenantId);

    // Update quote with pricing table
    const updatedQuote = await this.prisma.manualQuote.update({
      where: { id: quote.id },
      data: { pricingTable },
      include: {
        days: {
          include: {
            expenses: true,
          },
          orderBy: {
            dayNumber: 'asc',
          },
        },
      },
    });

    return updatedQuote;
  }

  /**
   * Get all manual quotes for a tenant
   */
  async findAll(tenantId: number, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [quotes, total] = await Promise.all([
      this.prisma.manualQuote.findMany({
        where: { tenantId, isActive: true },
        include: {
          days: {
            include: {
              expenses: true,
            },
            orderBy: {
              dayNumber: 'asc',
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip,
        take: limit,
      }),
      this.prisma.manualQuote.count({
        where: { tenantId, isActive: true },
      }),
    ]);

    return {
      data: quotes,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single manual quote by ID
   */
  async findOne(id: number, tenantId: number) {
    const quote = await this.prisma.manualQuote.findFirst({
      where: { id, tenantId },
      include: {
        days: {
          include: {
            expenses: true,
          },
          orderBy: {
            dayNumber: 'asc',
          },
        },
      },
    });

    if (!quote) {
      throw new NotFoundException(`Manual quote with ID ${id} not found`);
    }

    return quote;
  }

  /**
   * Update a manual quote
   */
  async update(id: number, updateDto: UpdateManualQuoteDto, tenantId: number) {
    await this.findOne(id, tenantId); // Ensure exists

    const { days, ...quoteData } = updateDto;

    const updateData: any = {
      ...quoteData,
      ...(quoteData.startDate && { startDate: new Date(quoteData.startDate) }),
      ...(quoteData.endDate && { endDate: new Date(quoteData.endDate) }),
      ...(quoteData.validFrom && { validFrom: new Date(quoteData.validFrom) }),
      ...(quoteData.validTo && { validTo: new Date(quoteData.validTo) }),
      ...(quoteData.markup && { markup: new Decimal(quoteData.markup) }),
      ...(quoteData.tax && { tax: new Decimal(quoteData.tax) }),
    };

    const quote = await this.prisma.manualQuote.update({
      where: { id },
      data: updateData,
      include: {
        days: {
          include: {
            expenses: true,
          },
          orderBy: {
            dayNumber: 'asc',
          },
        },
      },
    });

    // Recalculate pricing
    const pricingTable = await this.calculatePricing(id, tenantId);

    const updatedQuote = await this.prisma.manualQuote.update({
      where: { id },
      data: { pricingTable },
      include: {
        days: {
          include: {
            expenses: true,
          },
          orderBy: {
            dayNumber: 'asc',
          },
        },
      },
    });

    return updatedQuote;
  }

  /**
   * Delete a manual quote (soft delete)
   */
  async remove(id: number, tenantId: number) {
    await this.findOne(id, tenantId); // Ensure exists

    return this.prisma.manualQuote.update({
      where: { id },
      data: { isActive: false },
    });
  }

  /**
   * Add a day to a manual quote
   */
  async addDay(quoteId: number, dayDto: CreateManualQuoteDayDto, tenantId: number) {
    await this.findOne(quoteId, tenantId); // Ensure quote exists

    const day = await this.prisma.manualQuoteDay.create({
      data: {
        quoteId,
        dayNumber: dayDto.dayNumber,
        date: new Date(dayDto.date),
        expenses: dayDto.expenses
          ? {
              create: dayDto.expenses.map((expense) => ({
                category: expense.category,
                hotelCategory: expense.hotelCategory,
                location: expense.location,
                description: expense.description,
                price: new Decimal(expense.price),
                singleSupplement: expense.singleSupplement
                  ? new Decimal(expense.singleSupplement)
                  : null,
                child0to2: expense.child0to2 ? new Decimal(expense.child0to2) : null,
                child3to5: expense.child3to5 ? new Decimal(expense.child3to5) : null,
                child6to11: expense.child6to11 ? new Decimal(expense.child6to11) : null,
                vehicleCount: expense.vehicleCount,
                pricePerVehicle: expense.pricePerVehicle
                  ? new Decimal(expense.pricePerVehicle)
                  : null,
              })),
            }
          : undefined,
      },
      include: {
        expenses: true,
      },
    });

    // Recalculate pricing
    await this.recalculatePricing(quoteId, tenantId);

    return day;
  }

  /**
   * Update a day
   */
  async updateDay(
    quoteId: number,
    dayId: number,
    dayDto: Partial<CreateManualQuoteDayDto>,
    tenantId: number,
  ) {
    await this.findOne(quoteId, tenantId); // Ensure quote exists

    const day = await this.prisma.manualQuoteDay.update({
      where: { id: dayId },
      data: {
        ...(dayDto.dayNumber && { dayNumber: dayDto.dayNumber }),
        ...(dayDto.date && { date: new Date(dayDto.date) }),
      },
      include: {
        expenses: true,
      },
    });

    // Recalculate pricing
    await this.recalculatePricing(quoteId, tenantId);

    return day;
  }

  /**
   * Delete a day
   */
  async removeDay(quoteId: number, dayId: number, tenantId: number) {
    await this.findOne(quoteId, tenantId); // Ensure quote exists

    await this.prisma.manualQuoteDay.delete({
      where: { id: dayId },
    });

    // Recalculate pricing
    await this.recalculatePricing(quoteId, tenantId);

    return { success: true };
  }

  /**
   * Add an expense to a day
   */
  async addExpense(
    quoteId: number,
    dayId: number,
    expenseDto: CreateManualQuoteExpenseDto,
    tenantId: number,
  ) {
    await this.findOne(quoteId, tenantId); // Ensure quote exists

    const expense = await this.prisma.manualQuoteExpense.create({
      data: {
        quoteDayId: dayId,
        category: expenseDto.category,
        hotelCategory: expenseDto.hotelCategory,
        location: expenseDto.location,
        description: expenseDto.description,
        price: new Decimal(expenseDto.price),
        singleSupplement: expenseDto.singleSupplement
          ? new Decimal(expenseDto.singleSupplement)
          : null,
        child0to2: expenseDto.child0to2 ? new Decimal(expenseDto.child0to2) : null,
        child3to5: expenseDto.child3to5 ? new Decimal(expenseDto.child3to5) : null,
        child6to11: expenseDto.child6to11 ? new Decimal(expenseDto.child6to11) : null,
        vehicleCount: expenseDto.vehicleCount,
        pricePerVehicle: expenseDto.pricePerVehicle
          ? new Decimal(expenseDto.pricePerVehicle)
          : null,
      },
    });

    // Recalculate pricing
    await this.recalculatePricing(quoteId, tenantId);

    return expense;
  }

  /**
   * Update an expense
   */
  async updateExpense(
    quoteId: number,
    expenseId: number,
    expenseDto: Partial<CreateManualQuoteExpenseDto>,
    tenantId: number,
  ) {
    await this.findOne(quoteId, tenantId); // Ensure quote exists

    const updateData: any = {
      ...(expenseDto.category && { category: expenseDto.category }),
      ...(expenseDto.hotelCategory && { hotelCategory: expenseDto.hotelCategory }),
      ...(expenseDto.location && { location: expenseDto.location }),
      ...(expenseDto.description && { description: expenseDto.description }),
      ...(expenseDto.price !== undefined && { price: new Decimal(expenseDto.price) }),
      ...(expenseDto.singleSupplement !== undefined && {
        singleSupplement: expenseDto.singleSupplement ? new Decimal(expenseDto.singleSupplement) : null,
      }),
      ...(expenseDto.child0to2 !== undefined && {
        child0to2: expenseDto.child0to2 ? new Decimal(expenseDto.child0to2) : null,
      }),
      ...(expenseDto.child3to5 !== undefined && {
        child3to5: expenseDto.child3to5 ? new Decimal(expenseDto.child3to5) : null,
      }),
      ...(expenseDto.child6to11 !== undefined && {
        child6to11: expenseDto.child6to11 ? new Decimal(expenseDto.child6to11) : null,
      }),
      ...(expenseDto.vehicleCount !== undefined && { vehicleCount: expenseDto.vehicleCount }),
      ...(expenseDto.pricePerVehicle !== undefined && {
        pricePerVehicle: expenseDto.pricePerVehicle ? new Decimal(expenseDto.pricePerVehicle) : null,
      }),
    };

    const expense = await this.prisma.manualQuoteExpense.update({
      where: { id: expenseId },
      data: updateData,
    });

    // Recalculate pricing
    await this.recalculatePricing(quoteId, tenantId);

    return expense;
  }

  /**
   * Delete an expense
   */
  async removeExpense(quoteId: number, expenseId: number, tenantId: number) {
    await this.findOne(quoteId, tenantId); // Ensure quote exists

    await this.prisma.manualQuoteExpense.delete({
      where: { id: expenseId },
    });

    // Recalculate pricing
    await this.recalculatePricing(quoteId, tenantId);

    return { success: true };
  }

  /**
   * Recalculate pricing for a quote
   */
  async recalculatePricing(quoteId: number, tenantId: number) {
    const pricingTable = await this.calculatePricing(quoteId, tenantId);

    await this.prisma.manualQuote.update({
      where: { id: quoteId },
      data: { pricingTable },
    });

    return pricingTable;
  }

  /**
   * Calculate pricing table for different PAX slabs
   * Generates pricing for 2, 4, 6, 8, 10 passengers
   */
  private async calculatePricing(quoteId: number, tenantId: number) {
    const quote = await this.findOne(quoteId, tenantId);

    const paxSlabs = [2, 4, 6, 8, 10];
    const pricingTable: any = {};

    for (const paxCount of paxSlabs) {
      let totalCost = 0;

      for (const day of quote.days) {
        for (const expense of day.expenses) {
          const price = Number(expense.price);
          const pricePerVehicle = expense.pricePerVehicle
            ? Number(expense.pricePerVehicle)
            : null;

          if (quote.transportPricingMode === 'vehicle' && expense.category === 'transportation') {
            // Vehicle-based pricing
            if (pricePerVehicle && expense.vehicleCount) {
              totalCost += pricePerVehicle * expense.vehicleCount;
            }
          } else {
            // Per-person pricing
            totalCost += price * paxCount;
          }
        }
      }

      // Apply markup
      const markup = Number(quote.markup);
      const costWithMarkup = totalCost * (1 + markup / 100);

      // Apply tax
      const tax = Number(quote.tax);
      const finalPrice = costWithMarkup * (1 + tax / 100);

      pricingTable[`pax${paxCount}`] = {
        totalCost: Math.round(totalCost * 100) / 100,
        markup: Math.round((costWithMarkup - totalCost) * 100) / 100,
        tax: Math.round((finalPrice - costWithMarkup) * 100) / 100,
        totalPrice: Math.round(finalPrice * 100) / 100,
        pricePerPerson: Math.round((finalPrice / paxCount) * 100) / 100,
      };
    }

    return pricingTable;
  }
}
