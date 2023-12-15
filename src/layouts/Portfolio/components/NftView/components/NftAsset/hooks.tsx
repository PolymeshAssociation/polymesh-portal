import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';
import { getNftDetails, getNftCollectionAndStatus } from './helpers';
import { INftAsset } from './constants';

export const useNftAsset = () => {
  const [nft, setNft] = useState<INftAsset>();
  const [nftLoading, setNftLoading] = useState(true);

  const { identityLoading } = useContext(AccountContext);
  const { allPortfolios, portfolioLoading } = useContext(PortfolioContext);

  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const nftCollection = searchParams.get('nftCollection') || '';
  const nftId = searchParams.get('nftId') || '';

  useEffect(() => {
    if (!allPortfolios || portfolioLoading) {
      return;
    }
    setNftLoading(true);
    (async () => {
      try {
        const {
          nft: token,
          isLocked,
          collectionKeys,
        } = await getNftCollectionAndStatus(
          allPortfolios,
          nftCollection,
          nftId,
          portfolioId,
        );

        if (!token) {
          // redirect to portfolio in case nft is not found (to handle account switch)
          setSearchParams({});
          return;
        }

        const details = await getNftDetails(token, isLocked, collectionKeys);
        setNft(details);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setNftLoading(false);
      }
    })();
  }, [
    allPortfolios,
    nftCollection,
    nftId,
    portfolioId,
    portfolioLoading,
    identityLoading,
    setSearchParams,
  ]);

  return {
    nft,
    nftLoading,
  };
};
