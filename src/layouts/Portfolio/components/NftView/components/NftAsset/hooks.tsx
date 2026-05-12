import { useContext, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import {
  buildBalanceSearchParams,
  EBalanceHolder,
  getBalanceHolder,
} from '~/layouts/Portfolio/helpers';
import { INftAsset } from './constants';
import { getNftCollectionAndStatus, getNftDetails } from './helpers';

export const useNftAsset = () => {
  const [nft, setNft] = useState<INftAsset>();
  const [nftLoading, setNftLoading] = useState(true);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identityLoading, identity } = useContext(AccountContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const nftCollection = searchParams.get('nftCollection') || '';
  const nftId = searchParams.get('nftId') || '';
  const selectedHolder = getBalanceHolder(holder, portfolioId);
  const selectedPortfolioId =
    selectedHolder === EBalanceHolder.PORTFOLIO ? portfolioId : null;
  const selectedAccountAddress =
    selectedHolder === EBalanceHolder.ACCOUNT ? address : null;

  const identityRef = useRef<string | null>(null);

  useEffect(() => {
    if (!sdk || identityLoading) {
      return;
    }

    // Return to portfolio page if identity changes
    if (identityRef.current && identityRef.current !== identity?.did) {
      setSearchParams(
        buildBalanceSearchParams({
          holder: selectedHolder,
          portfolioId: selectedPortfolioId,
          additionalParams: {
            nftCollection,
          },
        }),
      );
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
          ownerAddress,
          ownerPortfolioId,
        } = await getNftCollectionAndStatus(
          nftCollection,
          nftId,
          selectedPortfolioId,
          identity?.did,
          sdk,
          selectedAccountAddress,
        );

        const details = await getNftDetails(
          token,
          isLocked,
          collectionKeys,
          ownerDid,
          ownerPortfolioId,
          ownerAddress,
        );
        setNft(details);
      } catch (error) {
        notifyError((error as Error).message);

        setSearchParams(
          buildBalanceSearchParams({
            holder: selectedHolder,
            portfolioId: selectedPortfolioId,
          }),
        );
      } finally {
        setNftLoading(false);
        identityRef.current = identity?.did || null;
      }
    })();
  }, [
    nftCollection,
    nftId,
    selectedPortfolioId,
    selectedAccountAddress,
    selectedHolder,
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
