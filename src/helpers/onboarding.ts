/**
 * Onboarding Service
 *
 * Handles interaction with the onboarding Cloudflare worker to request a DID
 * and test POLYX tokens on testnet. Used in place of self-signing for v8+
 * testnet accounts that have no POLYX to cover transaction fees.
 */

export interface OnboardResponse {
  success: boolean;
  did: string;
  targetAccount: string;
  polyxAmount: string;
  error?: string;
}

export async function onboardAccount(
  targetAccount: string,
): Promise<OnboardResponse> {
  const onboardingUrl = import.meta.env.VITE_ONBOARDING_URL;

  if (!onboardingUrl) {
    throw new Error('Onboarding service URL is not configured');
  }

  const response = await fetch(onboardingUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ targetAccount }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    try {
      const errorJson = JSON.parse(errorText);
      throw new Error(
        errorJson.error || errorJson.message || 'Onboarding failed',
      );
    } catch {
      if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please try again in a minute.');
      }
      throw new Error(`Onboarding failed: ${errorText || response.statusText}`);
    }
  }

  const data = await response.json();
  return data as OnboardResponse;
}
