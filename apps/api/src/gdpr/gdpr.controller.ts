import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { GdprService } from './gdpr.service';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';
import { TenantId } from '../common/decorators/tenant-id.decorator';
import { UserId } from '../common/decorators/current-user.decorator';

@ApiTags('GDPR')
@Controller('gdpr')
@ApiBearerAuth('bearerAuth')
export class GdprController {
  constructor(private readonly gdprService: GdprService) {}

  @Get('export/me')
  @ApiOperation({
    summary: 'Export my personal data (GDPR Article 20)',
    description: 'Export all personal data associated with the authenticated user',
  })
  @ApiResponse({
    status: 200,
    description: 'Personal data exported successfully',
  })
  async exportMyData(
    @UserId() userId: number,
    @TenantId() tenantId: number,
  ) {
    return this.gdprService.exportUserData(userId, tenantId);
  }

  @Get('export/client/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN, UserRole.AGENT)
  @ApiOperation({
    summary: 'Export client data (GDPR Article 20)',
    description: 'Export all personal data for a specific client',
  })
  @ApiResponse({
    status: 200,
    description: 'Client data exported successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async exportClientData(
    @Param('id', ParseIntPipe) clientId: number,
    @TenantId() tenantId: number,
    @UserId() userId: number,
  ) {
    return this.gdprService.exportClientData(clientId, tenantId, userId);
  }

  @Delete('client/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Anonymize client data (GDPR Article 17 - Right to be Forgotten)',
    description: 'Anonymize all personal data for a client while preserving booking history for legal purposes',
  })
  @ApiResponse({
    status: 200,
    description: 'Client data anonymized successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot anonymize client with active bookings',
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  async anonymizeClient(
    @Param('id', ParseIntPipe) clientId: number,
    @TenantId() tenantId: number,
    @UserId() userId: number,
  ) {
    return this.gdprService.anonymizeClient(clientId, tenantId, userId);
  }

  @Delete('user/:id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete user account',
    description: 'Soft delete a user account by deactivating it',
  })
  @ApiResponse({
    status: 200,
    description: 'User account deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Cannot delete OWNER account',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  async deleteUser(
    @Param('id', ParseIntPipe) userId: number,
    @TenantId() tenantId: number,
    @UserId() requestingUserId: number,
  ) {
    return this.gdprService.deleteUserAccount(userId, tenantId, requestingUserId);
  }

  @Get('compliance-status')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get GDPR compliance status',
    description: 'Get current GDPR compliance status for the tenant',
  })
  @ApiResponse({
    status: 200,
    description: 'Compliance status retrieved successfully',
  })
  async getComplianceStatus(@TenantId() tenantId: number) {
    return this.gdprService.getComplianceStatus(tenantId);
  }
}
