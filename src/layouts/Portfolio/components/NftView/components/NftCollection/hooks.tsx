import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AccountContext } from '~/context/AccountContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { notifyError } from '~/helpers/notifications';
import {
  buildBalanceSearchParams,
  EBalanceHolder,
  getBalanceHolder,
} from '~/layouts/Portfolio/helpers';
import { INftListItem } from '../../constants';
import {
  parseCollectionFromAccountCollections,
  parseCollectionFromPortfolio,
  parseCollectionFromPortfolios,
} from './helpers';

export const useNftCollection = (assetId?: string) => {
  const [nftList, setNftList] = useState<INftListItem[]>([]);
  const [nftListLoading, setNftListLoading] = useState(true);

  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const nftCollection = assetId || searchParams.get('nftCollection');
  const selectedHolder = getBalanceHolder(holder, portfolioId);
  const selectedPortfolioId =
    selectedHolder === EBalanceHolder.PORTFOLIO ? portfolioId : null;

  const { identityLoading } = useContext(AccountContext);
  const { allPortfolios, portfolioLoading, allAccountsData } =
    useContext(PortfolioContext);

  useEffect(() => {
    if (identityLoading || portfolioLoading || !nftCollection) {
      setNftList([]);
      setNftListLoading(true);
      return;
    }

    if (selectedHolder === EBalanceHolder.ACCOUNT) {
      setNftList([]);
      setNftListLoading(true);
      (async () => {
        try {
          const accountData = allAccountsData[address ?? '']?.collections ?? [];
          const data = await parseCollectionFromAccountCollections(
            accountData,
            nftCollection,
          );
          const sortedList = data.sort((a, b) => a.id - b.id);
          setNftList(sortedList);
        } catch (error) {
          notifyError((error as Error).message);
        } finally {
          setNftListLoading(false);
        }
      })();
      return;
    }

    setNftListLoading(true);

    (async () => {
      try {
        let data = [];
        if (!selectedPortfolioId) {
          const allAccountCollections = Object.values(allAccountsData).flatMap(
            ({ collections }) => collections,
          );
          const [portfolioData, accountData] = await Promise.all([
            parseCollectionFromPortfolios(allPortfolios, nftCollection),
            parseCollectionFromAccountCollections(
              allAccountCollections,
              nftCollection,
            ),
          ]);

          data = [...portfolioData, ...accountData];
        } else {
          const selectedPortfolio = allPortfolios.find(
            ({ id }) => id === selectedPortfolioId,
          );
          if (!selectedPortfolio) {
            setSearchParams(
              buildBalanceSearchParams({
                holder: EBalanceHolder.ALL,
                additionalParams: { nftCollection },
              }),
            );
            throw new Error(
              `Portfolio ID ${selectedPortfolioId} not found under the selected identity`,
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
    nftCollection,
    allAccountsData,
    allPortfolios,
    selectedPortfolioId,
    address,
    selectedHolder,
    setSearchParams,
    identityLoading,
    portfolioLoading,
  ]);

  return {
    nftList,
    nftListLoading,
  };
};
