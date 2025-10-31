import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';

@Injectable()
export class ExchangeRatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number) {
    return this.prisma.exchangeRate.findMany({
      where: { tenantId },
      orderBy: { rateDate: 'desc' },
    });
  }

  async findOne(id: number, tenantId: number) {
    const exchangeRate = await this.prisma.exchangeRate.findFirst({
      where: { id, tenantId },
    });

    if (!exchangeRate) {
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }

    return exchangeRate;
  }

  async getLatestRate(
    tenantId: number,
    fromCurrency: string,
    toCurrency: string,
  ) {
    const rate = await this.prisma.exchangeRate.findFirst({
      where: {
        tenantId,
        fromCurrency,
        toCurrency,
      },
      orderBy: { rateDate: 'desc' },
    });

    if (!rate) {
      throw new NotFoundException(
        `No exchange rate found for ${fromCurrency} to ${toCurrency}`,
      );
    }

    return rate;
  }

  async create(createExchangeRateDto: CreateExchangeRateDto, tenantId: number) {
    // Check for unique constraint
    const existing = await this.prisma.exchangeRate.findFirst({
      where: {
        tenantId,
        fromCurrency: createExchangeRateDto.fromCurrency || 'TRY',
        toCurrency: createExchangeRateDto.toCurrency || 'EUR',
        rateDate: createExchangeRateDto.rateDate,
      },
    });

    if (existing) {
      throw new ConflictException(
        `Exchange rate for this currency pair and date already exists`,
      );
    }

    const exchangeRate = await this.prisma.exchangeRate.create({
      data: {
        tenantId,
        fromCurrency: createExchangeRateDto.fromCurrency,
        toCurrency: createExchangeRateDto.toCurrency,
        rate: createExchangeRateDto.rate,
        rateDate: createExchangeRateDto.rateDate,
        source: createExchangeRateDto.source,
      },
    });

    return exchangeRate;
  }

  async update(
    id: number,
    updateExchangeRateDto: UpdateExchangeRateDto,
    tenantId: number,
  ) {
    const exchangeRate = await this.prisma.exchangeRate.findFirst({
      where: { id, tenantId },
    });

    if (!exchangeRate) {
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }

    const updatedExchangeRate = await this.prisma.exchangeRate.update({
      where: { id },
      data: {
        fromCurrency: updateExchangeRateDto.fromCurrency,
        toCurrency: updateExchangeRateDto.toCurrency,
        rate: updateExchangeRateDto.rate,
        rateDate: updateExchangeRateDto.rateDate,
        source: updateExchangeRateDto.source,
      },
    });

    return updatedExchangeRate;
  }

  async remove(id: number, tenantId: number) {
    const exchangeRate = await this.prisma.exchangeRate.findFirst({
      where: { id, tenantId },
    });

    if (!exchangeRate) {
      throw new NotFoundException(`Exchange rate with ID ${id} not found`);
    }

    await this.prisma.exchangeRate.delete({
      where: { id },
    });

    return { message: 'Exchange rate deleted successfully' };
  }
}
