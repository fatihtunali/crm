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
