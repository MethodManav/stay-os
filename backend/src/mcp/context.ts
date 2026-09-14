import { BadRequestError } from '../core/errors/BadRequestError';

export interface TenantContext {
  hotelId: string;
  organizationId?: string;
  hotelSlug?: string;
  hotelName?: string;
  currency?: string;
  timezone?: string;
}

/**
 * Validates that a trusted TenantContext is present.
 * The tenant context must ALWAYS originate from the authenticated session
 * or route slug, NEVER from LLM parameters.
 */
export function validateTenantContext(context: TenantContext | undefined | null): TenantContext {
  if (!context || !context.hotelId) {
    throw new BadRequestError('Secure tenant context missing: hotelId is required for this operation');
  }
  return context;
}
