import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';
import { INftListItem } from '../../constants';
import {
  parseCollectionFromPortfolio,
  parseCollectionFromPortfolios,
} from './helpers';

export const useNftCollection = () => {
  const [nftList, setNftList] = useState<INftListItem[]>([]);
  const [nftListLoading, setNftListLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const nftCollection = searchParams.get('nftCollection');

  const { identity, identityLoading } = useContext(AccountContext);
  const { allPortfolios, portfolioLoading } = useContext(PortfolioContext);

  useEffect(() => {
    if (identityLoading || portfolioLoading) {
      setNftList([]);
      setNftListLoading(true);
      return;
    }
    if (!identity || !nftCollection || !allPortfolios.length) {
      setNftList([]);
      setNftListLoading(false);
      return;
    }
    setNftListLoading(true);

    (async () => {
      try {
        let data = [];
        if (!portfolioId) {
          data = await parseCollectionFromPortfolios(
            allPortfolios,
            nftCollection,
          );
        } else {
          const selectedPortfolio = allPortfolios.find(
            ({ id }) => id === portfolioId,
          );
          if (!selectedPortfolio) {
            setSearchParams({ nftCollection });
            throw new Error(
              `Portfolio ID ${portfolioId} not found under the selected identity`,
            );
          }
          data = await parseCollectionFromPortfolio(
            selectedPortfolio as IPortfolioData,
            nftCollection,
          );
        }

        const sortedList = data.sort((a, b) => a.id - b.id);
        setNftList(sortedList);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setNftListLoading(false);
      }
    })();
  }, [
    identity,
    nftCollection,
    allPortfolios,
    portfolioId,
    setSearchParams,
    identityLoading,
    portfolioLoading,
  ]);

  return {
    nftList,
    nftListLoading,
  };
};
