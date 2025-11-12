import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import {
  DefaultPortfolio,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { useCallback, useContext, useEffect, useState } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';

export interface PortfolioReference {
  id: string;
  ownerDid?: string;
  portfolio?: DefaultPortfolio | NumberedPortfolio;
  name?: string; // Fallback hint
}

export interface PortfolioLookupResult {
  name: string;
  isOwned: boolean;
  isCustodied: boolean;
  isStale: boolean;
  isLoading: boolean;
}

// Module-level cache shared across all hook instances
// This ensures names fetched in one component are available in others
const portfolioNameCache = new Map<string, string>();
const fetchedKeys = new Set<string>();
const pendingFetches = new Map<string, Promise<string>>();

/**
 * Hook to lookup portfolio information with smart caching strategy:
 * 1. First checks PortfolioContext (allPortfolios + custodiedPortfolios) - no fetching needed
 * 2. For stale portfolios (not in context), fetches names once and caches at module level
 * 3. Uses composite key pattern (ownerDid-portfolioId) for proper deduplication
 * 4. Module-level cache persists across all component instances
 *
 * This eliminates duplicate portfolio name fetching logic across components.
 */
export const usePortfolioLookup = (portfoliosToTrack: PortfolioReference[]) => {
  const { allPortfolios, custodiedPortfolios } = useContext(PortfolioContext);
  const { identity } = useContext(AccountContext);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);

  // Local state to trigger re-renders when cache updates
  const [, setUpdateTrigger] = useState(0);
  const triggerUpdate = useCallback(() => setUpdateTrigger((n) => n + 1), []);

  // Fetch names for portfolios not in context (stale portfolios)
  useEffect(() => {
    if (!identity || !sdk) return;

    const namesToFetch: Array<{
      key: string;
      id: string;
      ownerDid: string;
    }> = [];

    portfoliosToTrack.forEach((ref) => {
      const { id, ownerDid, name } = ref;

      // Skip if no owner DID or if it's the default portfolio
      if (!ownerDid || id === 'default') return;

      const key = `${ownerDid}-${id}`;

      // If we have a name hint and don't have it cached yet, cache it immediately
      if (name && !portfolioNameCache.has(key)) {
        portfolioNameCache.set(key, name);
        triggerUpdate();
        return;
      }

      // Check if portfolio is in context (owned or custodied)
      const isInContext =
        allPortfolios.some(
          (p) => p.id === id && p.portfolio.owner.did === ownerDid,
        ) ||
        custodiedPortfolios.some(
          (p) => p.id === id && p.portfolio.owner.did === ownerDid,
        );

      // Only fetch if:
      // 1. Not in context (stale)
      // 2. Haven't fetched or currently fetching
      // 3. Don't already have cached
      if (
        !isInContext &&
        !fetchedKeys.has(key) &&
        !pendingFetches.has(key) &&
        !portfolioNameCache.has(key)
      ) {
        namesToFetch.push({ key, id, ownerDid });
      }
    });

    if (namesToFetch.length === 0) return;

    // Mark as fetched to prevent duplicate requests
    namesToFetch.forEach(({ key }) => fetchedKeys.add(key));

    // Fetch names in parallel, tracking pending fetches to avoid duplicates
    namesToFetch.forEach(({ key, id, ownerDid }) => {
      const fetchPromise = (async () => {
        try {
          // Reconstruct portfolio object from SDK
          const portfolioIdentity =
            ownerDid !== identity.did
              ? await sdk.identities.getIdentity({ did: ownerDid })
              : identity;

          const portfolioToFetch =
            (await portfolioIdentity.portfolios.getPortfolio({
              portfolioId: new BigNumber(id),
            })) as NumberedPortfolio;

          // Fetch the name
          const name = await portfolioToFetch.getName();
          portfolioNameCache.set(key, name);
          return name;
        } catch (error) {
          const fallbackName = 'Unknown Portfolio';
          portfolioNameCache.set(key, fallbackName);
          return fallbackName;
        } finally {
          pendingFetches.delete(key);
        }
      })();

      pendingFetches.set(key, fetchPromise);
    });

    // Wait for all fetches to complete, then trigger re-render
    Promise.all(Array.from(pendingFetches.values())).then(() => {
      triggerUpdate();
    });
  }, [
    portfoliosToTrack,
    allPortfolios,
    custodiedPortfolios,
    identity,
    sdk,
    triggerUpdate,
  ]);

  /**
   * Lookup portfolio information by ownerDid and id
   * Returns comprehensive metadata about the portfolio
   */
  const getPortfolioInfo = useCallback(
    (ownerDid: string | undefined, id: string): PortfolioLookupResult => {
      // Handle default portfolio
      if (id === 'default') {
        const isOwned = identity && ownerDid ? ownerDid === identity.did : true;

        return {
          name: 'Default Portfolio',
          isOwned,
          isCustodied: !isOwned,
          isStale: false,
          isLoading: false,
        };
      }

      // Check in owned portfolios
      const ownedPortfolio = allPortfolios.find(
        (p) => p.id === id && (!ownerDid || p.portfolio.owner.did === ownerDid),
      );

      if (ownedPortfolio) {
        return {
          name: ownedPortfolio.name,
          isOwned: true,
          isCustodied: false,
          isStale: false,
          isLoading: false,
        };
      }

      // Check in custodied portfolios
      const custodiedPortfolio = custodiedPortfolios.find(
        (p) => p.id === id && (!ownerDid || p.portfolio.owner.did === ownerDid),
      );

      if (custodiedPortfolio) {
        return {
          name: custodiedPortfolio.name,
          isOwned: false,
          isCustodied: true,
          isStale: false,
          isLoading: false,
        };
      }

      // Portfolio not in context - it's stale
      // Check module-level cache
      const key = ownerDid ? `${ownerDid}-${id}` : id;
      const cachedName = portfolioNameCache.get(key);

      // Check if we're currently fetching this portfolio
      const isLoading = pendingFetches.has(key);

      // Try to get name from: cache > provided hint > fallback to ID
      const hintName = portfoliosToTrack.find(
        (ref) => ref.id === id && ref.ownerDid === ownerDid,
      )?.name;

      return {
        name: cachedName || hintName || id,
        isOwned: false,
        isCustodied: false,
        isStale: true,
        isLoading,
      };
    },
    [allPortfolios, custodiedPortfolios, portfoliosToTrack, identity],
  );

  return { getPortfolioInfo };
};
