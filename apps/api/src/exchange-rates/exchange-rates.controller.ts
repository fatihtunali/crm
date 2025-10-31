import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ExchangeRatesService } from './exchange-rates.service';
import { CreateExchangeRateDto } from './dto/create-exchange-rate.dto';
import { UpdateExchangeRateDto } from './dto/update-exchange-rate.dto';
import { ImportRatesDto } from './dto/import-rates.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Exchange Rates')
@ApiBearerAuth('bearerAuth')
@Controller('exchange-rates')
@UseGuards(RolesGuard)
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

  @Post('import')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({
    summary: 'Import exchange rates from CSV',
    description: 'Import multiple exchange rates from CSV content. CSV format: fromCurrency,toCurrency,rate,rateDate (YYYY-MM-DD)',
  })
  @ApiResponse({
    status: 200,
    description: 'Import completed with summary',
    schema: {
      example: {
        summary: {
          total: 10,
          imported: 8,
          skipped: 1,
          errors: 1,
        },
        imported: [
          {
            id: 1,
            fromCurrency: 'TRY',
            toCurrency: 'EUR',
            rate: 0.0305,
            rateDate: '2024-01-15T00:00:00Z',
            source: 'csv-import',
          },
        ],
        skipped: ['TRY->USD on 2024-01-15 (already exists)'],
        errors: ['Line 5: Invalid rate value: abc'],
      },
    },
  })
  importFromCsv(
    @Body() importRatesDto: ImportRatesDto,
    @TenantId() tenantId: number,
  ) {
    return this.exchangeRatesService.importFromCsv(importRatesDto, tenantId);
  }

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Create a new exchange rate' })
  @ApiResponse({
    status: 201,
    description: 'Exchange rate created successfully',
  })
  create(
    @Body() createExchangeRateDto: CreateExchangeRateDto,
    @TenantId() tenantId: number,
  ) {
    return this.exchangeRatesService.create(createExchangeRateDto, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all exchange rates for current tenant' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rates retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.exchangeRatesService.findAll(tenantId, paginationDto);
  }

  @Get('latest')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get latest exchange rate for currency pair' })
  @ApiQuery({ name: 'from', type: String, required: true })
  @ApiQuery({ name: 'to', type: String, required: true })
  @ApiResponse({
    status: 200,
    description: 'Latest exchange rate retrieved successfully',
  })
  getLatest(
    @TenantId() tenantId: number,
    @Query('from') fromCurrency: string,
    @Query('to') toCurrency: string,
  ) {
    return this.exchangeRatesService.getLatestRate(
      tenantId,
      fromCurrency,
      toCurrency,
    );
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get exchange rate by ID' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.exchangeRatesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.OPERATIONS, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Update exchange rate' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateExchangeRateDto: UpdateExchangeRateDto,
    @TenantId() tenantId: number,
  ) {
    return this.exchangeRatesService.update(id, updateExchangeRateDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete exchange rate' })
  @ApiResponse({
    status: 200,
    description: 'Exchange rate deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Exchange rate not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.exchangeRatesService.remove(id, tenantId);
  }
}
