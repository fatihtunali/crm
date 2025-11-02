import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';

/**
 * Issue #33: Soft Delete Interceptor
 *
 * This interceptor converts DELETE operations to soft deletes by setting
 * isActive=false and deletedAt=now() instead of hard deleting records.
 *
 * Usage: Apply @SoftDelete() decorator to controllers or methods that should
 * use soft delete behavior.
 *
 * Note: This is a placeholder interceptor. The actual implementation should be
 * done in the service layer for better control and transaction support.
 */

export const SOFT_DELETE_KEY = 'softDelete';

@Injectable()
export class SoftDeleteInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const isSoftDelete = this.reflector.getAllAndOverride<boolean>(
      SOFT_DELETE_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!isSoftDelete) {
      return next.handle();
    }

    // For soft delete implementation, it's better to handle this in services
    // rather than interceptors to ensure proper database transactions
    // See documentation in service implementations

    return next.handle();
  }
}
