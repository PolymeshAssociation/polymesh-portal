import { useState, useEffect, useContext, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';
import { getNftDetails, getNftCollectionAndStatus } from './helpers';
import { INftAsset } from './constants';
import { PolymeshContext } from '~/context/PolymeshContext';

export const useNftAsset = () => {
  const [nft, setNft] = useState<INftAsset>();
  const [nftLoading, setNftLoading] = useState(true);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identityLoading, identity } = useContext(AccountContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const nftCollection = searchParams.get('nftCollection') || '';
  const nftId = searchParams.get('nftId') || '';

  const identityRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sdk || identityLoading) {
      return;
    }

    // Return to portfolio page if identity changes
    if (identityRef.current && identityRef.current !== identity?.did) {
      setSearchParams({});
      return;
    }
    setNftLoading(true);
    (async () => {
      try {
        const {
          nft: token,
          isLocked,
          collectionKeys,
          ownerDid,
          ownerPortfolioId,
        } = await getNftCollectionAndStatus(
          nftCollection,
          nftId,
          portfolioId,
          identity?.did,
          sdk,
        );

        const details = await getNftDetails(
          token,
          isLocked,
          collectionKeys,
          ownerDid,
          ownerPortfolioId,
        );
        setNft(details);
      } catch (error) {
        notifyError((error as Error).message);
        setSearchParams('');
      } finally {
        setNftLoading(false);
        identityRef.current = identity?.did || null;
      }
    })();
  }, [
    nftCollection,
    nftId,
    portfolioId,
    identityLoading,
    setSearchParams,
    sdk,
    identity,
  ]);

  return {
    nft,
    nftLoading,
  };
};
