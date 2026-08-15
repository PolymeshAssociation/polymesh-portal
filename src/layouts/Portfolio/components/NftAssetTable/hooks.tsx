import {
  ColumnDef,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  PaginationState,
  useReactTable,
} from '@tanstack/react-table';
import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IMovementQueryResponse,
  ITransactionsQueryResponse,
} from '~/constants/queries/types';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import {
  portfolioMovementsQuery,
  transferEventsQuery,
} from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import { EBalanceHolder, getBalanceHolder } from '../../helpers';
import { getPortfolioNumber } from '../AssetTable/helpers';
import { getNftImageUrl } from '../NftView/helpers';
import { columns } from './config';
import { ENftAssetsTableTabs, INftAssetItem, TNftTableItem } from './constants';
import {
  mergeCollectionItems,
  parseCollectionFromCollections,
  parseCollectionFromPortfolio,
  parseCollectionFromPortfolios,
  parseNftAssetsFromCollections,
  parseNftAssetsFromPortfolio,
  parseNftAssetsFromPortfolios,
  parseNftMovements,
  parseNftTransactions,
} from './helpers';

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
  const holder = searchParams.get('holder');
  const address = searchParams.get('address');
  const selectedHolder = getBalanceHolder(holder, portfolioId);
  const selectedPortfolioId =
    selectedHolder === EBalanceHolder.PORTFOLIO ? portfolioId : null;
  const {
    api: { gqlClient },
    state: { middlewareMetadata },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);
  const { allPortfolios, portfolioLoading, allAccountsData } =
    useContext(PortfolioContext);

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

    if (
      currentTab !== tabRef.current ||
      selectedPortfolioId !== portfolioRef.current
    ) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [currentTab, selectedPortfolioId, pageSize, tableDataLoading]);

  useEffect(() => {
    if (
      portfolioLoading ||
      (currentTab !== ENftAssetsTableTabs.COLLECTIONS &&
        currentTab !== ENftAssetsTableTabs.ALL_NFTS)
    ) {
      return;
    }

    tabRef.current = currentTab;
    portfolioRef.current = selectedPortfolioId;

    setTableDataLoading(true);
    (async () => {
      try {
        if (selectedHolder === EBalanceHolder.ACCOUNT) {
          const accountData = allAccountsData[address ?? '']?.collections ?? [];
          const data =
            currentTab === ENftAssetsTableTabs.COLLECTIONS
              ? await parseCollectionFromCollections(accountData)
              : await parseNftAssetsFromCollections(accountData);

          setTableData(data);
          setTotalItems(data.length);
          return;
        }

        let data = [];
        if (!selectedPortfolioId) {
          const allAccountCollections = Object.values(allAccountsData).flatMap(
            ({ collections }) => collections,
          );
          if (currentTab === ENftAssetsTableTabs.COLLECTIONS) {
            const [portfolioCollections, accountHolderCollections] =
              await Promise.all([
                parseCollectionFromPortfolios(allPortfolios),
                parseCollectionFromCollections(allAccountCollections),
              ]);

            data = mergeCollectionItems([
              ...portfolioCollections,
              ...accountHolderCollections,
            ]);
          } else {
            const [portfolioNfts, accountHolderNfts] = await Promise.all([
              parseNftAssetsFromPortfolios(allPortfolios),
              parseNftAssetsFromCollections(allAccountCollections),
            ]);

            data = [...portfolioNfts, ...accountHolderNfts];
          }
        } else {
          const selectedPortfolio = allPortfolios.find(
            ({ id }) => id === selectedPortfolioId,
          );
          if (!selectedPortfolio) {
            throw new Error(
              `Portfolio with ID ${selectedPortfolioId} was not found.`,
            );
          }
          data =
            currentTab === ENftAssetsTableTabs.COLLECTIONS
              ? await parseCollectionFromPortfolio(selectedPortfolio)
              : await parseNftAssetsFromPortfolio(selectedPortfolio);
        }
        setTableData(data);
        setTotalItems(data.length);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setTableDataLoading(false);
      }
    })();
  }, [
    allAccountsData,
    allPortfolios,
    currentTab,
    selectedPortfolioId,
    address,
    selectedHolder,
    portfolioLoading,
  ]);

  useEffect(() => {
    if (
      (currentTab !== ENftAssetsTableTabs.TRANSACTIONS &&
        currentTab !== ENftAssetsTableTabs.MOVEMENTS) ||
      portfolioLoading ||
      !identity ||
      !gqlClient ||
      !middlewareMetadata
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
          const getMovementFilterParams = () => {
            if (selectedHolder === EBalanceHolder.ACCOUNT) {
              return { accountAddress: address };
            }
            if (selectedHolder === EBalanceHolder.ALL) {
              return { identityId: identity.did };
            }
            return {
              portfolioNumber: getPortfolioNumber(
                identity.did,
                selectedPortfolioId,
              ),
            };
          };
          const { data } = await gqlClient.query<IMovementQueryResponse>({
            query: portfolioMovementsQuery({
              offset,
              pageSize,
              type: 'NonFungible',
              ...getMovementFilterParams(),
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
                portfolioId: selectedPortfolioId,
                accountAddress:
                  selectedHolder === EBalanceHolder.ACCOUNT ? address : null,
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
        portfolioRef.current = selectedPortfolioId;
        setTableDataLoading(false);
      }
    })();
  }, [
    address,
    currentTab,
    gqlClient,
    identity,
    middlewareMetadata,
    pageIndex,
    pageSize,
    portfolioLoading,
    selectedHolder,
    selectedPortfolioId,
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
    tableDataLoading:
      tableDataLoading || portfolioLoading || currentTab !== tabRef.current,
    totalItems,
  };
};
