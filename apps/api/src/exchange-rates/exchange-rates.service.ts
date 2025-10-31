import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { ImportRatesDto, ExchangeRateRow } from './dto/import-rates.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { createPaginatedResponse, PaginatedResponse } from '../common/interfaces/paginated-response.interface';

@Injectable()
export class ExchangeRatesService {
  constructor(private prisma: PrismaService) {}

  async findAll(tenantId: number, paginationDto: PaginationDto): Promise<PaginatedResponse<any>> {
    const { skip, take, sortBy = 'rateDate', order = 'desc' } = paginationDto;
    const where = { tenantId };

    const [data, total] = await Promise.all([
      this.prisma.exchangeRate.findMany({
        where,
        skip,
        take,
        orderBy: { [sortBy]: order },
      }),
      this.prisma.exchangeRate.count({ where }),
    ]);

    return createPaginatedResponse(data, total, paginationDto.page ?? 1, paginationDto.limit ?? 50);
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

  async importFromCsv(importRatesDto: ImportRatesDto, tenantId: number) {
    const { csvContent } = importRatesDto;

    // Parse CSV content
    const lines = csvContent.trim().split('\n');
    const rows: ExchangeRateRow[] = [];
    const errors: string[] = [];

    // Process each line (skip header if present)
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Skip header row if it contains "fromCurrency" or "from_currency"
      if (i === 0 && (line.toLowerCase().includes('fromcurrency') || line.toLowerCase().includes('from_currency'))) {
        continue;
      }

      const parts = line.split(',').map(p => p.trim());

      if (parts.length !== 4) {
        errors.push(`Line ${i + 1}: Expected 4 columns, got ${parts.length}`);
        continue;
      }

      const [fromCurrency, toCurrency, rateStr, rateDate] = parts;

      // Validate currencies
      if (fromCurrency.length !== 3 || toCurrency.length !== 3) {
        errors.push(`Line ${i + 1}: Currency codes must be 3 characters`);
        continue;
      }

      // Validate rate
      const rate = parseFloat(rateStr);
      if (isNaN(rate) || rate <= 0) {
        errors.push(`Line ${i + 1}: Invalid rate value: ${rateStr}`);
        continue;
      }

      // Validate date (basic ISO format check)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(rateDate)) {
        errors.push(`Line ${i + 1}: Invalid date format, expected YYYY-MM-DD: ${rateDate}`);
        continue;
      }

      rows.push({
        fromCurrency: fromCurrency.toUpperCase(),
        toCurrency: toCurrency.toUpperCase(),
        rate,
        rateDate,
      });
    }

    // Import valid rows
    const imported: any[] = [];
    const skipped: string[] = [];

    for (const row of rows) {
      try {
        // Check if rate already exists
        const existing = await this.prisma.exchangeRate.findFirst({
          where: {
            tenantId,
            fromCurrency: row.fromCurrency,
            toCurrency: row.toCurrency,
            rateDate: new Date(row.rateDate),
          },
        });

        if (existing) {
          skipped.push(
            `${row.fromCurrency}->${row.toCurrency} on ${row.rateDate} (already exists)`,
          );
          continue;
        }

        // Create exchange rate
        const created = await this.prisma.exchangeRate.create({
          data: {
            tenantId,
            fromCurrency: row.fromCurrency,
            toCurrency: row.toCurrency,
            rate: row.rate,
            rateDate: new Date(row.rateDate),
            source: 'csv-import',
          },
        });

        imported.push(created);
      } catch (error: any) {
        errors.push(
          `Failed to import ${row.fromCurrency}->${row.toCurrency} on ${row.rateDate}: ${error.message}`,
        );
      }
    }

    return {
      summary: {
        total: rows.length,
        imported: imported.length,
        skipped: skipped.length,
        errors: errors.length,
      },
      imported,
      skipped,
      errors,
    };
  }
}
