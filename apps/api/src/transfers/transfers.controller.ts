import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TransfersService } from './transfers.service';
import { CreateTransferDto } from './dto/create-transfer.dto';
import { UpdateTransferDto } from './dto/update-transfer.dto';
import { CreateTransferRateDto } from './dto/create-transfer-rate.dto';
import { UpdateTransferRateDto } from './dto/update-transfer-rate.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/current-user.decorator';

@ApiTags('Transfers')
@Controller('transfers')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('bearerAuth')
export class TransfersController {
  constructor(private readonly transfersService: TransfersService) {}

  // ============================================
  // TRANSFERS (Details)
  // ============================================

  @Post()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create transfer details' })
  createTransfer(
    @TenantId() tenantId: number,
    @Body() createTransferDto: CreateTransferDto,
  ) {
    return this.transfersService.createTransfer(tenantId, createTransferDto);
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all transfers' })
  @ApiQuery({ name: 'originZone', required: false, type: String })
  @ApiQuery({ name: 'destZone', required: false, type: String })
  @ApiQuery({ name: 'transferType', required: false, type: String })
  @ApiQuery({ name: 'supplierId', required: false, type: Number })
  findAllTransfers(
    @TenantId() tenantId: number,
    @Query('originZone') originZone?: string,
    @Query('destZone') destZone?: string,
    @Query('transferType') transferType?: string,
    @Query('supplierId') supplierId?: string,
  ) {
    return this.transfersService.findAllTransfers(
      tenantId,
      originZone,
      destZone,
      transferType,
      supplierId ? parseInt(supplierId, 10) : undefined,
    );
  }

  @Get('search')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Search transfers' })
  search(@TenantId() tenantId: number, @Query('q') searchTerm: string) {
    return this.transfersService.searchTransfers(tenantId, searchTerm);
  }

  // ============================================
  // TRANSFER RATES (Must come before generic :serviceOfferingId route)
  // ============================================

  @Post('rates')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create transfer rate' })
  createTransferRate(
    @TenantId() tenantId: number,
    @Body() createTransferRateDto: CreateTransferRateDto,
  ) {
    return this.transfersService.createTransferRate(
      tenantId,
      createTransferRateDto,
    );
  }

  @Get('rates')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get all transfer rates' })
  @ApiQuery({ name: 'serviceOfferingId', required: false, type: Number })
  @ApiQuery({ name: 'dateFrom', required: false, type: String })
  @ApiQuery({ name: 'dateTo', required: false, type: String })
  findAllTransferRates(
    @TenantId() tenantId: number,
    @Query('serviceOfferingId') serviceOfferingId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.transfersService.findAllTransferRates(
      tenantId,
      serviceOfferingId ? parseInt(serviceOfferingId, 10) : undefined,
      dateFrom,
      dateTo,
    );
  }

  @Get('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get transfer rate by ID' })
  findOneTransferRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.transfersService.findOneTransferRate(id, tenantId);
  }

  @Patch('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update transfer rate' })
  updateTransferRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Body() updateTransferRateDto: UpdateTransferRateDto,
  ) {
    return this.transfersService.updateTransferRate(
      id,
      tenantId,
      updateTransferRateDto,
    );
  }

  @Delete('rates/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete transfer rate (soft delete)' })
  removeTransferRate(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.transfersService.removeTransferRate(id, tenantId);
  }

  // ============================================
  // TRANSFERS (Generic routes - must come after specific routes)
  // ============================================

  @Get(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT, UserRole.OPERATIONS)
  @ApiOperation({ summary: 'Get transfer by service offering ID' })
  findOneTransfer(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
  ) {
    return this.transfersService.findOneTransfer(serviceOfferingId, tenantId);
  }

  @Patch(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Update transfer' })
  updateTransfer(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
    @Body() updateTransferDto: UpdateTransferDto,
  ) {
    return this.transfersService.updateTransfer(
      serviceOfferingId,
      tenantId,
      updateTransferDto,
    );
  }

  @Delete(':serviceOfferingId')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Delete transfer (soft delete)' })
  removeTransfer(
    @Param('serviceOfferingId', ParseIntPipe) serviceOfferingId: number,
    @TenantId() tenantId: number,
  ) {
    return this.transfersService.removeTransfer(serviceOfferingId, tenantId);
  }
}
