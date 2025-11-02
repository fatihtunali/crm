import { SetMetadata } from '@nestjs/common';
import { ConsentPurpose } from '../../consent/dto/create-consent.dto';

export const REQUIRE_CONSENT_KEY = 'requireConsent';

/**
 * Decorator to enforce consent checking before allowing an action
 * Usage: @RequireConsent(ConsentPurpose.MARKETING_EMAIL)
 */
export const RequireConsent = (purpose: ConsentPurpose) =>
  SetMetadata(REQUIRE_CONSENT_KEY, purpose);
