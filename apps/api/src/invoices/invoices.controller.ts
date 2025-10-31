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
  Res,
  StreamableFile,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { Response } from 'express';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { UpdateInvoiceDto } from './dto/update-invoice.dto';
import { PaginationDto } from '../common/dto/pagination.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Invoices')
@ApiBearerAuth('JWT-auth')
@Controller('invoices')
@UseGuards(RolesGuard)
export class InvoicesController {
  constructor(private readonly invoicesService: InvoicesService) {}

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Create a new invoice' })
  @ApiResponse({
    status: 201,
    description: 'Invoice created successfully',
  })
  create(
    @Body() createInvoiceDto: CreateInvoiceDto,
    @TenantId() tenantId: number,
  ) {
    return this.invoicesService.create(createInvoiceDto, tenantId);
  }

  @Get()
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get all invoices for current tenant' })
  @ApiQuery({
    name: 'bookingId',
    type: Number,
    required: false,
    description: 'Filter by booking ID',
  })
  @ApiResponse({
    status: 200,
    description: 'Invoices retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query() paginationDto: PaginationDto,
    @Query('bookingId', new ParseIntPipe({ optional: true }))
    bookingId?: number,
  ) {
    return this.invoicesService.findAll(tenantId, paginationDto, bookingId);
  }

  @Get('stats')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Get invoice statistics by currency' })
  @ApiResponse({
    status: 200,
    description: 'Invoice statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: number) {
    return this.invoicesService.getStats(tenantId);
  }

  @Get(':id/pdf')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Generate and download invoice PDF' })
  @ApiResponse({
    status: 200,
    description: 'Invoice PDF generated successfully',
    content: {
      'application/pdf': {
        schema: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  async generatePDF(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const pdfStream = await this.invoicesService.generatePDF(id, tenantId);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${id}.pdf"`,
    });

    return new StreamableFile(pdfStream);
  }

  @Get(':id')
  @Roles(
    UserRole.OWNER,
    UserRole.ADMIN,
    UserRole.AGENT,
    UserRole.OPERATIONS,
    UserRole.ACCOUNTING,
  )
  @ApiOperation({ summary: 'Get invoice by ID' })
  @ApiResponse({
    status: 200,
    description: 'Invoice retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.invoicesService.findOne(id, tenantId);
  }

  @Patch(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.ACCOUNTING)
  @ApiOperation({ summary: 'Update invoice' })
  @ApiResponse({
    status: 200,
    description: 'Invoice updated successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateInvoiceDto: UpdateInvoiceDto,
    @TenantId() tenantId: number,
  ) {
    return this.invoicesService.update(id, updateInvoiceDto, tenantId);
  }

  @Delete(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete invoice' })
  @ApiResponse({
    status: 200,
    description: 'Invoice deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Invoice not found' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.invoicesService.remove(id, tenantId);
  }
}
