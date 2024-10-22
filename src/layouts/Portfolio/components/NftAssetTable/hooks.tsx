import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { useSearchParams } from 'react-router-dom';
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { AccountContext } from '~/context/AccountContext';
import { IPortfolioData } from '~/context/PortfolioContext/constants';
import {
  transferEventsQuery,
  portfolioMovementsQuery,
} from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import {
  IMovementQueryResponse,
  ITransactionsQueryResponse,
} from '~/constants/queries/types';
import { getPortfolioNumber } from '../AssetTable/helpers';
import { getNftImageUrl } from '../NftView/helpers';
import { columns } from './config';
import {
  parseCollectionFromPortfolios,
  parseCollectionFromPortfolio,
  parseNftAssetsFromPortfolios,
  parseNftAssetsFromPortfolio,
  parseNftMovements,
  parseNftTransactions,
} from './helpers';
import { ENftAssetsTableTabs, TNftTableItem, INftAssetItem } from './constants';

const initialPaginationState = { pageIndex: 0, pageSize: 10 };

const imageUrlCache = new Map();

export const useNftAssetTable = (currentTab: ENftAssetsTableTabs) => {
  const [tableData, setTableData] = useState<TNftTableItem[]>([]);
  const [tableDataLoading, setTableDataLoading] = useState(false);
  const [totalPages, setTotalPages] = useState(-1);
  const [totalItems, setTotalItems] = useState(0);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>(
    initialPaginationState,
  );
  const [shouldLoadNftImages, setShouldLoadNftImages] = useState(false);
  const imagesLoadedRef = useRef(false);

  const tabRef = useRef<ENftAssetsTableTabs>(ENftAssetsTableTabs.COLLECTIONS);
  const portfolioRef = useRef<string | null>(null);

  const [searchParams] = useSearchParams();
  const portfolioId = searchParams.get('id');
  const {
    api: { gqlClient },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);
  const { allPortfolios, portfolioLoading } = useContext(PortfolioContext);

  useEffect(() => {
    if (
      currentTab === ENftAssetsTableTabs.ALL_NFTS &&
      !imagesLoadedRef.current
    ) {
      setShouldLoadNftImages(true);
    }
    if (currentTab !== ENftAssetsTableTabs.ALL_NFTS) {
      imagesLoadedRef.current = false;
    }
  }, [currentTab]);

  useEffect(() => {
    if (tableDataLoading) return;

    if (currentTab !== tabRef.current || portfolioId !== portfolioRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab, portfolioId, pageSize, tableDataLoading]);

  useEffect(() => {
    if (!identity || !allPortfolios || portfolioLoading) {
      return;
    }

    if (
      currentTab !== ENftAssetsTableTabs.COLLECTIONS &&
      currentTab !== ENftAssetsTableTabs.ALL_NFTS
    ) {
      return;
    }

    tabRef.current = currentTab;
    portfolioRef.current = portfolioId;

    setTableDataLoading(true);
    (async () => {
      try {
        let data = [];
        if (!portfolioId) {
          data =
            currentTab === ENftAssetsTableTabs.COLLECTIONS
              ? await parseCollectionFromPortfolios(allPortfolios)
              : await parseNftAssetsFromPortfolios(allPortfolios);
        } else {
          const selectedPortfolio = allPortfolios.find(
            ({ id }) => id === portfolioId,
          );
          data =
            currentTab === ENftAssetsTableTabs.COLLECTIONS
              ? await parseCollectionFromPortfolio(
                  selectedPortfolio as IPortfolioData,
                )
              : await parseNftAssetsFromPortfolio(
                  selectedPortfolio as IPortfolioData,
                );
        }
        setTableData(data);
        setTotalItems(data.length);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setTableDataLoading(false);
      }
    })();
  }, [allPortfolios, currentTab, identity, portfolioId, portfolioLoading]);

  useEffect(() => {
    if (
      (currentTab !== ENftAssetsTableTabs.TRANSACTIONS &&
        currentTab !== ENftAssetsTableTabs.MOVEMENTS) ||
      portfolioLoading ||
      !identity ||
      !gqlClient
    ) {
      return;
    }

    if (currentTab !== tabRef.current && pageIndex !== 0) return;

    setTableData([]);
    setTableDataLoading(true);
    const offset = pageIndex * pageSize;

    (async () => {
      try {
        if (currentTab === ENftAssetsTableTabs.MOVEMENTS) {
          const { data } = await gqlClient.query<IMovementQueryResponse>({
            query: portfolioMovementsQuery({
              offset,
              pageSize,
              type: 'NonFungible',
              portfolioNumber: getPortfolioNumber(identity.did, portfolioId),
            }),
          });
          const parsedMovements = parseNftMovements(data);
          setTableData(parsedMovements);
          setTotalItems(data.portfolioMovements.totalCount);
          setTotalPages(
            Math.ceil(data.portfolioMovements.totalCount / pageSize),
          );
        } else {
          const { data: transfers } =
            await gqlClient.query<ITransactionsQueryResponse>({
              query: transferEventsQuery({
                identityId: identity.did,
                portfolioId,
                offset,
                pageSize,
                nonFungible: true,
              }),
            });
          const data = parseNftTransactions(transfers);
          setTableData(data);
          setTotalItems(transfers.assetTransactions.totalCount);
          setTotalPages(
            Math.ceil(transfers.assetTransactions.totalCount / pageSize),
          );
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        tabRef.current = currentTab;
        portfolioRef.current = portfolioId;
        setTableDataLoading(false);
      }
    })();
  }, [
    currentTab,
    gqlClient,
    identity,
    pageIndex,
    pageSize,
    portfolioId,
    portfolioLoading,
  ]);

  useEffect(() => {
    if (!shouldLoadNftImages || imagesLoadedRef.current) {
      return;
    }

    if (currentTab !== ENftAssetsTableTabs.ALL_NFTS) {
      return;
    }

    (async () => {
      try {
        if (!(tableData[0] as INftAssetItem)?.nft && !!tableData.length) {
          return;
        }

        const newTableData = await Promise.all(
          tableData.map(async (item) => {
            const { nft } = item as INftAssetItem;
            let imageUrl = imageUrlCache.get(nft.uuid);

            if (!imageUrl) {
              imageUrl = await getNftImageUrl(nft);
              imageUrlCache.set(nft.uuid, imageUrl);
            }

            return {
              ...item,
              ticker: {
                ...(item as INftAssetItem).ticker,
                imgUrl: imageUrl,
              },
            };
          }),
        );
        if (newTableData.length) {
          setTableData(newTableData);
          setShouldLoadNftImages(false);
          imagesLoadedRef.current = true;
        }
      } catch (error) {
        notifyError((error as Error).message);
      }
    })();
  }, [tableData, currentTab, shouldLoadNftImages]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return {
    table: useReactTable<TNftTableItem>({
      data: tableData,
      columns: columns[currentTab] as ColumnDef<TNftTableItem>[],
      state: { pagination },
      manualPagination:
        currentTab !== ENftAssetsTableTabs.COLLECTIONS &&
        currentTab !== ENftAssetsTableTabs.ALL_NFTS,
      pageCount:
        currentTab !== ENftAssetsTableTabs.ALL_NFTS &&
        currentTab !== ENftAssetsTableTabs.COLLECTIONS
          ? totalPages
          : Math.ceil(tableData.length ? tableData.length / pageSize : 1),
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      enableSortingRemoval: false,
    }),
    tableDataLoading: tableDataLoading || currentTab !== tabRef.current,
    totalItems,
  };
};
