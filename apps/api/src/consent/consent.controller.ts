import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ConsentService } from './consent.service';
import { CreateConsentDto, ConsentPurpose } from './dto/create-consent.dto';
import { BulkGrantConsentDto } from './dto/bulk-grant-consent.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Consent Management')
@ApiBearerAuth()
@Controller('consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post()
  @ApiOperation({ summary: 'Grant or deny consent for a specific purpose' })
  @ApiResponse({ status: 201, description: 'Consent recorded successfully' })
  @ApiResponse({ status: 404, description: 'Client not found' })
  async grantConsent(
    @Body() createConsentDto: CreateConsentDto,
    @TenantId() tenantId: number,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    return this.consentService.grantConsent(
      createConsentDto,
      tenantId,
      ipAddress,
      userAgent,
    );
  }

  @Post('bulk-grant')
  @ApiOperation({ summary: 'Grant multiple consents at once for a client' })
  @ApiResponse({ status: 201, description: 'Consents granted successfully' })
  async bulkGrantConsent(
    @Body() bulkGrantConsentDto: BulkGrantConsentDto,
    @TenantId() tenantId: number,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';
    const userId = (req.user as any)?.userId;

    return this.consentService.bulkGrantConsent(
      bulkGrantConsentDto,
      tenantId,
      ipAddress,
      userAgent,
      userId,
    );
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all active consents for a client' })
  @ApiResponse({ status: 200, description: 'List of active consents' })
  async getClientConsents(
    @Param('clientId', ParseIntPipe) clientId: number,
    @TenantId() tenantId: number,
  ) {
    return this.consentService.getClientConsents(clientId, tenantId);
  }

  @Get('client/:clientId/history')
  @ApiOperation({ summary: 'Get consent history including revoked consents' })
  @ApiResponse({ status: 200, description: 'Full consent history' })
  async getConsentHistory(
    @Param('clientId', ParseIntPipe) clientId: number,
    @TenantId() tenantId: number,
  ) {
    return this.consentService.getConsentHistory(clientId, tenantId);
  }

  @Get('check')
  @ApiOperation({ summary: 'Check if client has granted consent for a purpose' })
  @ApiResponse({ status: 200, description: 'Consent check result' })
  async checkConsent(
    @Query('clientId', ParseIntPipe) clientId: number,
    @Query('purpose') purpose: ConsentPurpose,
    @TenantId() tenantId: number,
  ) {
    const hasConsent = await this.consentService.hasConsent(
      clientId,
      purpose,
      tenantId,
    );

    return {
      clientId,
      purpose,
      hasConsent,
    };
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get consent statistics for the tenant' })
  @ApiResponse({ status: 200, description: 'Consent statistics' })
  async getStatistics(@TenantId() tenantId: number) {
    return this.consentService.getConsentStatistics(tenantId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Revoke a consent' })
  @ApiResponse({ status: 200, description: 'Consent revoked successfully' })
  @ApiResponse({ status: 404, description: 'Consent not found' })
  async revokeConsent(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
    @Req() req: Request,
  ) {
    const userId = (req.user as any)?.userId;
    return this.consentService.revokeConsent(id, tenantId, userId);
  }
}
