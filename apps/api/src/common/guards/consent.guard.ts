import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConsentService } from '../../consent/consent.service';
import { REQUIRE_CONSENT_KEY } from '../decorators/require-consent.decorator';
import { ConsentPurpose } from '../../consent/dto/create-consent.dto';

@Injectable()
export class ConsentGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private consentService: ConsentService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPurpose = this.reflector.getAllAndOverride<ConsentPurpose>(
      REQUIRE_CONSENT_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPurpose) {
      // No consent required for this endpoint
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Extract clientId from request body, params, or query
    const clientId =
      request.body?.clientId ||
      parseInt(request.params?.clientId) ||
      parseInt(request.query?.clientId);

    if (!clientId) {
      throw new ForbiddenException(
        'Client ID is required for consent validation',
      );
    }

    if (!user?.tenantId) {
      throw new ForbiddenException('User must be authenticated');
    }

    // Check if client has granted consent for this purpose
    const hasConsent = await this.consentService.hasConsent(
      clientId,
      requiredPurpose,
      user.tenantId,
    );

    if (!hasConsent) {
      throw new ForbiddenException(
        `Client has not granted consent for ${requiredPurpose}. Please obtain consent before proceeding.`,
      );
    }

    return true;
  }
}
