import { Injectable, NestMiddleware, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrivacyPolicyService } from '../../privacy-policy/privacy-policy.service';

/**
 * Privacy Policy Check Middleware (Issue #26)
 *
 * This middleware checks if the user/client has accepted the latest privacy policy version.
 * If not, it returns a 403 Forbidden response requiring policy acceptance.
 *
 * This middleware should be selectively applied to routes that require privacy policy acceptance.
 */
@Injectable()
export class PrivacyPolicyCheckMiddleware implements NestMiddleware {
  constructor(private readonly privacyPolicyService: PrivacyPolicyService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const user = (req as any).user;

    // Skip if no authenticated user
    if (!user || !user.tenantId) {
      return next();
    }

    try {
      // Check if user requires re-acceptance
      const requiresAcceptance = await this.privacyPolicyService.requiresReAcceptance(
        user.userId || null,
        null, // We're checking user, not client
        user.tenantId,
      );

      if (requiresAcceptance) {
        const currentVersion = await this.privacyPolicyService.getCurrentVersion(
          user.tenantId,
        );

        throw new ForbiddenException({
          message: 'Privacy policy acceptance required',
          code: 'PRIVACY_POLICY_ACCEPTANCE_REQUIRED',
          currentVersion,
          acceptanceEndpoint: '/api/v1/privacy-policy/accept',
        });
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      // Don't block requests if privacy policy check fails
      // Log error and continue
      console.error('Privacy policy check failed:', error);
      next();
    }
  }
}
