import { useContext, useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import { PortfolioContext } from '~/context/PortfolioContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';
import { getCollectionCreationTime } from '~/helpers/graphqlQueries';
import { splitByCapitalLetters } from '~/helpers/formatters';
import { INftListItem } from '../../constants';
import { ICollectionDetails } from './constants';
import {
  parseCollectionFromPortfolio,
  parseCollectionFromPortfolios,
  getDateTime,
} from './helpers';

export const useNftCollection = () => {
  const [nftList, setNftList] = useState<INftListItem[]>([]);
  const [nftListLoading, setNftListLoading] = useState(true);
  const [details, setDetails] = useState<ICollectionDetails>();

  const [searchParams, setSearchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const nftCollection = searchParams.get('nftCollection');

  const {
    api: { sdk, gqlClient },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);
  const { allPortfolios } = useContext(PortfolioContext);

  useEffect(() => {
    if (
      !sdk ||
      !identity ||
      !nftCollection ||
      !allPortfolios.length ||
      !gqlClient
    ) {
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

        const collectionInfo = await sdk.assets.getNftCollection({
          ticker: nftCollection,
        });

        const details = await collectionInfo.details();

        const keys = await collectionInfo.collectionKeys();

        const collectionId = await collectionInfo.getCollectionId();
        const docs = await collectionInfo.documents.get();
        const createdAtData = await gqlClient.query({
          query: getCollectionCreationTime(nftCollection),
        });
        const createdAt = createdAtData.data.assets.nodes[0].createdAt;

        const meta = await collectionInfo.metadata.get();

        const metaData = await Promise.all(
          meta.map(async (entry, i) => {
            const details = await entry.details();
            const value = await entry.value();

            return {
              name: details.name ? splitByCapitalLetters(details.name) : '',
              description: details.specs.description,
              expiry: value?.expiry ? getDateTime(value?.expiry) : null,
              isLocked: value?.lockStatus
                ? splitByCapitalLetters(value?.lockStatus)
                : null,
              value: value?.value || null,
            };
          }),
        );
        if (!data.length) {
          setSearchParams();
        }

        const sortedList = data.sort((a, b) => a.id - b.id);
        setDetails({
          collectionId: collectionId.toNumber(),
          name: details.name,
          assetType: details.assetType,
          owner: details.owner.did,
          totalSupply: details.totalSupply.toNumber(),
          createdAt: createdAt,
          docs: docs.data,
          metaData,
        });
        setNftList(sortedList);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setNftListLoading(false);
      }
    })();
  }, [sdk, identity, nftCollection, allPortfolios, portfolioId, gqlClient]);

  return {
    nftList,
    details,
    nftListLoading,
  };
};