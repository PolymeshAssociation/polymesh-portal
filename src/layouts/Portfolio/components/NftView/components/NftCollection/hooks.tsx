import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { PortfolioContext } from '~/context/PortfolioContext';
import { PolymeshContext } from '~/context/PolymeshContext';
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

  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);
  const { allPortfolios } = useContext(PortfolioContext);

  useEffect(() => {
    if (!sdk || !identity || !nftCollection || !allPortfolios.length) {
      setNftList([]);
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
          data = await parseCollectionFromPortfolio(
            selectedPortfolio as IPortfolioData,
            nftCollection,
          );
        }
        if (!data.length) {
          setSearchParams();
        }
        setNftList(data);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setNftListLoading(false);
      }
    })();
  }, [sdk, identity, nftCollection, allPortfolios, portfolioId]);

  return {
    nftList,
    nftListLoading,
  };
};
