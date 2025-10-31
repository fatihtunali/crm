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
import { QuotationsService } from './quotations.service';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import { SearchQuotationDto } from './dto/search-quotation.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole, QuotationStatus } from '@tour-crm/shared';

@ApiTags('Quotations')
@ApiBearerAuth('bearerAuth')
@Controller('quotations')
@UseGuards(RolesGuard)
export class QuotationsController {
  constructor(private readonly quotationsService: QuotationsService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Create a new quotation' })
  @ApiResponse({ status: 201, description: 'Quotation created successfully' })
  create(
    @Body() createQuotationDto: CreateQuotationDto,
    @TenantId() tenantId: number,
  ) {
    return this.quotationsService.create(createQuotationDto, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all quotations for current tenant with pagination' })
  @ApiQuery({ name: 'status', enum: QuotationStatus, required: false })
  @ApiResponse({
    status: 200,
    description: 'Quotations retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
    @Query('status') status?: QuotationStatus,
  ) {
    return this.quotationsService.findAll(tenantId, paginationDto, status);
  }

  @Get('search')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({
    summary: 'Search quotations with filters',
    description: 'Advanced search for quotations by client name, tour name, status, and dates'
  })
  @ApiResponse({ status: 200, description: 'Quotations search results retrieved successfully' })
  search(
    @TenantId() tenantId: number,
    @Query() searchDto: SearchQuotationDto,
  ) {
    return this.quotationsService.search(tenantId, searchDto);
  }

  @Get('stats')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get quotation statistics by status' })
  @ApiResponse({
    status: 200,
    description: 'Statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: number) {
    return this.quotationsService.getStatsByStatus(tenantId);
  }

  @Post(':id/send')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Send quotation to client (DRAFT → SENT)' })
  @ApiResponse({
    status: 200,
    description: 'Quotation sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition or missing client email',
  })
  sendQuotation(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.quotationsService.sendQuotation(id, tenantId);
  }

  @Post(':id/accept')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Accept quotation (SENT → ACCEPTED)' })
  @ApiResponse({
    status: 200,
    description: 'Quotation accepted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  acceptQuotation(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.quotationsService.acceptQuotation(id, tenantId);
  }

  @Post(':id/reject')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Reject quotation (SENT → REJECTED)' })
  @ApiResponse({
    status: 200,
    description: 'Quotation rejected successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Quotation not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status transition',
  })
  rejectQuotation(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.quotationsService.rejectQuotation(id, tenantId);
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get quotation by ID with full details' })
  @ApiResponse({
    status: 200,
    description: 'Quotation retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.quotationsService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Update quotation' })
  @ApiResponse({ status: 200, description: 'Quotation updated successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateQuotationDto: UpdateQuotationDto,
    @TenantId() tenantId: number,
  ) {
    return this.quotationsService.update(id, updateQuotationDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete quotation' })
  @ApiResponse({ status: 200, description: 'Quotation deleted successfully' })
  @ApiResponse({ status: 404, description: 'Quotation not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.quotationsService.remove(id, tenantId);
  }
}
