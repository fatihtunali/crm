import {
  Controller,
  Get,
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
} from '@nestjs/swagger';
import { AuditLogsService } from './audit-logs.service';
import { AuditLogFilterDto } from './dto/audit-log-filter.dto';
import { TenantId } from '../common/decorators/current-user.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { UserRole } from '@tour-crm/shared';

@ApiTags('Audit Logs')
@ApiBearerAuth('bearerAuth')
@Controller('audit-logs')
@UseGuards(RolesGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get all audit logs with filtering',
    description:
      'Query audit logs with support for filtering by entity, user, action, date range, and IP address',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
  })
  findAll(
    @TenantId() tenantId: number,
    @Query() filterDto: AuditLogFilterDto,
  ) {
    return this.auditLogsService.findAll(tenantId, filterDto);
  }

  @Get('stats')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Get audit log statistics',
    description:
      'Returns aggregated statistics including action counts, entity counts, and recent activity',
  })
  @ApiResponse({
    status: 200,
    description: 'Audit log statistics retrieved successfully',
  })
  getStats(@TenantId() tenantId: number) {
    return this.auditLogsService.getStats(tenantId);
  }

  @Get('reports/pii-access')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Generate PII access report (GDPR compliance)',
    description:
      'Report showing who accessed personally identifiable information (PII) and when. Includes passport numbers, tax IDs, bank details, etc.',
  })
  @ApiResponse({
    status: 200,
    description: 'PII access report generated successfully',
  })
  getPiiAccessReport(
    @TenantId() tenantId: number,
    @Query('userId', new ParseIntPipe({ optional: true })) userId?: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('entity') entity?: string,
  ) {
    return this.auditLogsService.getPiiAccessReport(tenantId, {
      userId,
      dateFrom,
      dateTo,
      entity,
    });
  }

  @Get('reports/gdpr-compliance')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({
    summary: 'Generate GDPR compliance report',
    description:
      'Comprehensive report on GDPR-related activities: data exports, deletions, consent changes, and privacy policy acceptances',
  })
  @ApiResponse({
    status: 200,
    description: 'GDPR compliance report generated successfully',
  })
  getGdprComplianceReport(
    @TenantId() tenantId: number,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.auditLogsService.getGdprComplianceReport(tenantId, dateFrom, dateTo);
  }

  @Get(':id')
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiOperation({ summary: 'Get audit log by ID' })
  @ApiResponse({
    status: 200,
    description: 'Audit log retrieved successfully',
  })
  @ApiResponse({ status: 404, description: 'Audit log not found' })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @TenantId() tenantId: number,
  ) {
    return this.auditLogsService.findOne(id, tenantId);
  }
}
