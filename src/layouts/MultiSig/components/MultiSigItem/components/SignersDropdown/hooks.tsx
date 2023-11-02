import { useState, useEffect, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { IRawMultiSigVote } from '~/constants/queries/types';
import { useWindowWidth } from '~/hooks/utility';
import { getColumns } from './config';
import { ISignerItem } from './constants';

const defaultPageSize = 10;

export const useSignersTable = (votes: IRawMultiSigVote[]) => {
  const { isMobile } = useWindowWidth();
  const { signers } = useMultiSigContext();

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

  const signersList = useMemo(() => {
    const list = signers.map((signer) => {
      const voteStatus = votes.find(
        (vote) => vote.signer.signerValue === signer,
      );
      return {
        address: signer,
        status: voteStatus?.action || 'Pending',
      };
    });
    const lastIndex = (pageIndex + 1) * defaultPageSize;
    const firstIndex = lastIndex - pageSize;
    return list.slice(firstIndex, lastIndex);
  }, [pageIndex, pageSize, votes, signers]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [votes]);

  return {
    table: useReactTable<ISignerItem>({
      data: signersList,
      columns: getColumns(isMobile) as ColumnDef<ISignerItem>[],
      state: { pagination },
      manualPagination: true,
      pageCount: Math.ceil(votes.length / defaultPageSize),
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableSorting: false,
    }),
    paginationState: pagination,
    tableLoading: !votes.length,
    totalItems: votes.length,
  };
};
