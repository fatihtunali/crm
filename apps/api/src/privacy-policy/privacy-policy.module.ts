import { Module } from '@nestjs/common';
import { PrivacyPolicyController } from './privacy-policy.controller';
import { PrivacyPolicyService } from './privacy-policy.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';

@Module({
  imports: [PrismaModule, AuditLogsModule],
  controllers: [PrivacyPolicyController],
  providers: [PrivacyPolicyService],
  exports: [PrivacyPolicyService],
})
export class PrivacyPolicyModule {}
