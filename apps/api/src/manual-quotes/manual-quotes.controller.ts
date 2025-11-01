import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { ManualQuotesService } from './manual-quotes.service';
import { CreateManualQuoteDto } from './dto/create-manual-quote.dto';
import { UpdateManualQuoteDto } from './dto/update-manual-quote.dto';
import { CreateManualQuoteDayDto } from './dto/create-manual-quote-day.dto';
import { CreateManualQuoteExpenseDto } from './dto/create-manual-quote-expense.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Manual Quotes')
@ApiBearerAuth('bearerAuth')
@Controller('manual-quotes')
@UseGuards(RolesGuard)
export class ManualQuotesController {
  constructor(private readonly manualQuotesService: ManualQuotesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Create a new manual quote' })
  @ApiResponse({ status: 201, description: 'Quote created successfully' })
  create(@Body() createDto: CreateManualQuoteDto, @TenantId() tenantId: number) {
    return this.manualQuotesService.create(createDto, tenantId);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all manual quotes' })
  @ApiResponse({ status: 200, description: 'Quotes retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  findAll(
    @TenantId() tenantId: number,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.manualQuotesService.findAll(tenantId, page, limit);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get a manual quote by ID' })
  @ApiResponse({ status: 200, description: 'Quote retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  findOne(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.manualQuotesService.findOne(id, tenantId);
  }

  @Put(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update a manual quote' })
  @ApiResponse({ status: 200, description: 'Quote updated successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateManualQuoteDto,
    @TenantId() tenantId: number,
  ) {
    return this.manualQuotesService.update(id, updateDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({ summary: 'Delete a manual quote (soft delete)' })
  @ApiResponse({ status: 200, description: 'Quote deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quote not found' })
  remove(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.manualQuotesService.remove(id, tenantId);
  }

  // === DAY MANAGEMENT ===

  @Post(':id/days')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Add a day to a manual quote' })
  @ApiResponse({ status: 201, description: 'Day added successfully' })
  addDay(
    @Param('id', ParseIntPipe) id: number,
    @Body() dayDto: CreateManualQuoteDayDto,
    @TenantId() tenantId: number,
  ) {
    return this.manualQuotesService.addDay(id, dayDto, tenantId);
  }

  @Put(':id/days/:dayId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update a day in a manual quote' })
  @ApiResponse({ status: 200, description: 'Day updated successfully' })
  updateDay(
    @Param('id', ParseIntPipe) id: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() dayDto: Partial<CreateManualQuoteDayDto>,
    @TenantId() tenantId: number,
  ) {
    return this.manualQuotesService.updateDay(id, dayId, dayDto, tenantId);
  }

  @Delete(':id/days/:dayId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Delete a day from a manual quote' })
  @ApiResponse({ status: 200, description: 'Day deleted successfully' })
  removeDay(
    @Param('id', ParseIntPipe) id: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @TenantId() tenantId: number,
  ) {
    return this.manualQuotesService.removeDay(id, dayId, tenantId);
  }

  // === EXPENSE MANAGEMENT ===

  @Post(':id/days/:dayId/expenses')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Add an expense to a day' })
  @ApiResponse({ status: 201, description: 'Expense added successfully' })
  addExpense(
    @Param('id', ParseIntPipe) id: number,
    @Param('dayId', ParseIntPipe) dayId: number,
    @Body() expenseDto: CreateManualQuoteExpenseDto,
    @TenantId() tenantId: number,
  ) {
    return this.manualQuotesService.addExpense(id, dayId, expenseDto, tenantId);
  }

  @Put(':id/expenses/:expenseId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update an expense' })
  @ApiResponse({ status: 200, description: 'Expense updated successfully' })
  updateExpense(
    @Param('id', ParseIntPipe) id: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @Body() expenseDto: Partial<CreateManualQuoteExpenseDto>,
    @TenantId() tenantId: number,
  ) {
    return this.manualQuotesService.updateExpense(id, expenseId, expenseDto, tenantId);
  }

  @Delete(':id/expenses/:expenseId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Delete an expense' })
  @ApiResponse({ status: 200, description: 'Expense deleted successfully' })
  removeExpense(
    @Param('id', ParseIntPipe) id: number,
    @Param('expenseId', ParseIntPipe) expenseId: number,
    @TenantId() tenantId: number,
  ) {
    return this.manualQuotesService.removeExpense(id, expenseId, tenantId);
  }

  // === PRICING ===

  @Post(':id/calculate')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Recalculate pricing for a quote' })
  @ApiResponse({ status: 200, description: 'Pricing recalculated successfully' })
  recalculatePricing(@Param('id', ParseIntPipe) id: number, @TenantId() tenantId: number) {
    return this.manualQuotesService.recalculatePricing(id, tenantId);
  }
}
