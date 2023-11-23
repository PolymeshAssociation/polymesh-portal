import { useState, useEffect, useMemo, useContext } from 'react';
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
import { AccountContext } from '~/context/AccountContext';

const defaultPageSize = 10;

export const useSignersTable = (
  votes: IRawMultiSigVote[],
  isHistorical: boolean,
) => {
  const { isMobile, isTablet } = useWindowWidth();
  const { signers } = useMultiSigContext();
  const { allAccountsWithMeta } = useContext(AccountContext);

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

  const isSmallScreen = isMobile || isTablet;

  const signersList = useMemo(() => {
    const list = signers.reduce((acc, signer) => {
      const voteStatus = votes.find(
        (vote) => vote.signer.signerValue === signer,
      );
      const hasAction = voteStatus?.action;
      if (isHistorical && !hasAction) {
        return acc;
      }
      return [
        ...acc,
        {
          address: signer,
          status: hasAction || 'Pending',
        },
      ];
    }, [] as ISignerItem[]);
    const lastIndex = (pageIndex + 1) * pageSize;
    const firstIndex = pageIndex * pageSize;
    return list.slice(firstIndex, lastIndex);
  }, [pageIndex, pageSize, votes, signers]);

  useEffect(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, [votes]);

  return {
    table: useReactTable<ISignerItem>({
      data: signersList,
      columns: getColumns(
        isSmallScreen,
        allAccountsWithMeta,
      ) as ColumnDef<ISignerItem>[],
      state: { pagination },
      manualPagination: true,
      pageCount: Math.ceil(signers.length / pageSize),
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      enableSorting: false,
    }),
    paginationState: pagination,
    tableLoading: !votes.length,
    totalItems: signers.length,
  };
};
