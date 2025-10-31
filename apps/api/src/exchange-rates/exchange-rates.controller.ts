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
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Exchange Rates')
@ApiBearerAuth('JWT-auth')
@Controller('exchange-rates')
@UseGuards(RolesGuard)
export class ExchangeRatesController {
  constructor(private readonly exchangeRatesService: ExchangeRatesService) {}

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
  findAll(@TenantId() tenantId: number) {
    return this.exchangeRatesService.findAll(tenantId);
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
