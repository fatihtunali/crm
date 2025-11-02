import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuditLogsService } from '../../audit-logs/audit-logs.service';

/**
 * PII Access Logger Interceptor (Issue #22 - Enhanced Audit Logging)
 *
 * This interceptor logs access to Personally Identifiable Information (PII)
 * for GDPR compliance and audit trail purposes.
 *
 * PII fields tracked:
 * - passportNumber
 * - dateOfBirth
 * - taxId
 * - ssn (if added)
 * - creditCard (if added)
 * - bankAccount (if added)
 * - email (in some contexts)
 * - phone (in some contexts)
 */
@Injectable()
export class PiiAccessLogger implements NestInterceptor {
  private readonly piiFields = [
    'passportNumber',
    'passport_number',
    'dateOfBirth',
    'date_of_birth',
    'taxId',
    'tax_id',
    'ssn',
    'creditCard',
    'credit_card',
    'bankAccount',
    'bank_account',
    'bankAccountNo',
    'bank_account_no',
    'bankIban',
    'bank_iban',
  ];

  constructor(private readonly auditLogsService: AuditLogsService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Skip if no user (public endpoint)
    if (!user) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        if (this.containsPii(data)) {
          this.logPiiAccess(data, context, user, request);
        }
      }),
    );
  }

  /**
   * Check if the response data contains any PII fields
   */
  private containsPii(data: any): boolean {
    if (!data || typeof data !== 'object') {
      return false;
    }

    // Check if any PII field exists in the data
    return this.piiFields.some((field) => this.hasField(data, field));
  }

  /**
   * Recursively check if a field exists in the data object
   */
  private hasField(obj: any, field: string): boolean {
    if (!obj || typeof obj !== 'object') {
      return false;
    }

    // Check direct property
    if (obj.hasOwnProperty(field) && obj[field] !== null && obj[field] !== undefined) {
      return true;
    }

    // Check in arrays
    if (Array.isArray(obj)) {
      return obj.some((item) => this.hasField(item, field));
    }

    // Check in nested objects
    return Object.values(obj).some((value) => this.hasField(value, field));
  }

  /**
   * Get list of PII fields that are present in the data
   */
  private getPiiFields(data: any): string[] {
    const foundFields: string[] = [];

    for (const field of this.piiFields) {
      if (this.hasField(data, field)) {
        foundFields.push(field);
      }
    }

    return foundFields;
  }

  /**
   * Extract entity ID from the response data
   */
  private extractEntityId(data: any): number | null {
    if (!data) return null;

    // Try to find id in different possible locations
    if (data.id) return data.id;
    if (data.data?.id) return data.data.id;
    if (Array.isArray(data) && data.length > 0 && data[0].id) return data[0].id;

    return null;
  }

  /**
   * Extract entity type from the controller class name
   */
  private extractEntityType(controllerName: string): string {
    // Remove 'Controller' suffix if present
    return controllerName.replace(/Controller$/, '');
  }

  /**
   * Log PII access to audit logs
   */
  private async logPiiAccess(
    data: any,
    context: ExecutionContext,
    user: any,
    request: any,
  ): Promise<void> {
    try {
      const entityType = this.extractEntityType(context.getClass().name);
      const entityId = this.extractEntityId(data);
      const piiFieldsAccessed = this.getPiiFields(data);

      await this.auditLogsService.create({
        tenantId: user.tenantId,
        userId: user.userId,
        entity: entityType,
        entityId: entityId || 0,
        action: 'PII_ACCESSED',
        diffJson: {
          endpoint: request.url,
          method: request.method,
          piiFieldsAccessed,
          timestamp: new Date().toISOString(),
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.get('user-agent') || 'unknown',
      });
    } catch (error) {
      // Log error but don't fail the request
      console.error('Failed to log PII access:', error);
    }
  }
}
