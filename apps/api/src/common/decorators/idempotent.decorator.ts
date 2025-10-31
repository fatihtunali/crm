import { SetMetadata } from '@nestjs/common';
import { IDEMPOTENCY_ENABLED } from '../interceptors/idempotency.interceptor';

/**
 * Marks an endpoint as idempotent.
 * Requires clients to send an 'idempotency-key' header.
 * Responses are cached for 24 hours.
 */
export const Idempotent = () => SetMetadata(IDEMPOTENCY_ENABLED, true);
