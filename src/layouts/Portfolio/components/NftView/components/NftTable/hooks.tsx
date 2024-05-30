import { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { INftListItem } from '../../constants';
import { INftTableItem } from './constants';
import { columns } from './config';

const defaultPageSize = 10;

export const useNftTable = (nftList: INftListItem[]) => {
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  const nfts = useMemo(() => {
    const lastIndex = (pageIndex + 1) * pageSize;
    const firstIndex = lastIndex - pageSize;
    return nftList
      .map(({ id, ticker, isLocked }) => ({
        id: { id, imgUrl: ticker.imgUrl },
        imgUrl: ticker.imgUrl,
        isLocked,
      }))
      .slice(firstIndex, lastIndex);
  }, [pageIndex, pageSize, nftList]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [nftList]);

  return {
    table: useReactTable<INftTableItem>({
      data: nfts,
      columns: columns as ColumnDef<INftTableItem>[],
      state: { pagination },
      manualPagination: true,
      pageCount: Math.ceil(nftList.length / pageSize),
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
  };
};
