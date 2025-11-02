import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  ParseIntPipe,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PrivacyPolicyService } from './privacy-policy.service';
import { AcceptPrivacyPolicyDto } from './dto/accept-privacy-policy.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { Request } from 'express';

@ApiTags('Privacy Policy')
@ApiBearerAuth()
@Controller('privacy-policy')
export class PrivacyPolicyController {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  @Post('accept')
  @ApiOperation({ summary: 'Record privacy policy acceptance' })
  @ApiResponse({ status: 201, description: 'Privacy policy acceptance recorded' })
  async acceptPrivacyPolicy(
    @Body() acceptDto: AcceptPrivacyPolicyDto,
    @TenantId() tenantId: number,
    @Req() req: Request,
  ) {
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.get('user-agent') || 'unknown';

    return this.privacyPolicyService.recordAcceptance(
      acceptDto,
      tenantId,
      ipAddress,
      userAgent,
    );
  }

  @Get('current-version')
  @ApiOperation({ summary: 'Get current privacy policy version' })
  @ApiResponse({ status: 200, description: 'Current version retrieved' })
  async getCurrentVersion(@TenantId() tenantId: number) {
    const version = await this.privacyPolicyService.getCurrentVersion(tenantId);
    return {
      version,
      effectiveDate: '2025-01-01', // Update this when deploying new version
    };
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get all privacy policy acceptances for a user' })
  @ApiResponse({ status: 200, description: 'User acceptances retrieved' })
  async getUserAcceptances(
    @Param('userId', ParseIntPipe) userId: number,
    @TenantId() tenantId: number,
  ) {
    return this.privacyPolicyService.getUserAcceptances(userId, tenantId);
  }

  @Get('client/:clientId')
  @ApiOperation({ summary: 'Get all privacy policy acceptances for a client' })
  @ApiResponse({ status: 200, description: 'Client acceptances retrieved' })
  async getClientAcceptances(
    @Param('clientId', ParseIntPipe) clientId: number,
    @TenantId() tenantId: number,
  ) {
    return this.privacyPolicyService.getClientAcceptances(clientId, tenantId);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get privacy policy acceptance statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved' })
  async getStatistics(@TenantId() tenantId: number) {
    return this.privacyPolicyService.getAcceptanceStatistics(tenantId);
  }

  @Get('check-acceptance/:userId')
  @ApiOperation({ summary: 'Check if user needs to re-accept privacy policy' })
  @ApiResponse({ status: 200, description: 'Acceptance status checked' })
  async checkUserAcceptance(
    @Param('userId', ParseIntPipe) userId: number,
    @TenantId() tenantId: number,
  ) {
    const requiresAcceptance = await this.privacyPolicyService.requiresReAcceptance(
      userId,
      null,
      tenantId,
    );

    const currentVersion = await this.privacyPolicyService.getCurrentVersion(tenantId);
    const latestAcceptance = await this.privacyPolicyService.getLatestAcceptance(
      userId,
      null,
      tenantId,
    );

    return {
      requiresAcceptance,
      currentVersion,
      acceptedVersion: latestAcceptance?.version || null,
      acceptedAt: latestAcceptance?.acceptedAt || null,
    };
  }
}
