import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Request, Response } from 'express';
import { PrismaService } from '../../prisma/prisma.service';
import { Reflector } from '@nestjs/core';

export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';
export const IDEMPOTENCY_ENABLED = 'idempotency:enabled';

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  private readonly logger = new Logger(IdempotencyInterceptor.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly reflector: Reflector,
  ) {}

  async intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Promise<Observable<any>> {
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();

    // Check if idempotency is enabled for this endpoint
    const isIdempotent = this.reflector.get<boolean>(
      IDEMPOTENCY_ENABLED,
      context.getHandler(),
    );

    if (!isIdempotent) {
      return next.handle();
    }

    // Extract idempotency key from header
    const idempotencyKey = request.headers[IDEMPOTENCY_KEY_HEADER] as string;

    if (!idempotencyKey) {
      throw new ConflictException(
        `${IDEMPOTENCY_KEY_HEADER} header is required for this endpoint`,
      );
    }

    // Extract tenant ID from request (added by auth middleware)
    const tenantId = (request as any).user?.tenantId;

    if (!tenantId) {
      // If no tenant ID, proceed without idempotency (will likely fail at auth layer)
      return next.handle();
    }

    try {
      // Check if this idempotency key was used before
      const existingKey = await this.prisma.idempotencyKey.findUnique({
        where: {
          tenantId_key: {
            tenantId,
            key: idempotencyKey,
          },
        },
      });

      if (existingKey) {
        // Check if key expired
        if (new Date() > existingKey.expiresAt) {
          // Key expired, delete it and proceed with new request
          await this.prisma.idempotencyKey.delete({
            where: { id: existingKey.id },
          });
        } else {
          // Return cached response
          this.logger.log(
            `Returning cached response for idempotency key: ${idempotencyKey}`,
          );
          response.status(existingKey.responseStatus);
          return of(existingKey.responseBody);
        }
      }

      // Process request and cache response
      return next.handle().pipe(
        tap(async (data) => {
          try {
            const responseStatus = response.statusCode;

            // Only cache successful responses (2xx)
            if (responseStatus >= 200 && responseStatus < 300) {
              const expiresAt = new Date();
              expiresAt.setHours(expiresAt.getHours() + 24); // 24 hour expiration

              await this.prisma.idempotencyKey.create({
                data: {
                  tenantId,
                  key: idempotencyKey,
                  requestPath: request.path,
                  requestMethod: request.method,
                  requestBody: request.body || {},
                  responseStatus,
                  responseBody: data,
                  expiresAt,
                },
              });

              this.logger.log(
                `Cached response for idempotency key: ${idempotencyKey}`,
              );
            }
          } catch (error) {
            // Log error but don't fail the request
            this.logger.error(
              `Failed to cache idempotency key: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
          }
        }),
        catchError((error) => {
          // Don't cache error responses
          throw error;
        }),
      );
    } catch (error) {
      this.logger.error(
        `Idempotency check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      // On error, proceed with the request
      return next.handle();
    }
  }
}
