import { useState, useEffect, useContext, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { MultiSig } from '@polymeshassociation/polymesh-sdk/internal';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { getMultisigProposalsQuery } from '~/constants/queries';
import { notifyError } from '~/helpers/notifications';
import { IRawMultiSigProposal } from '~/constants/queries/types';
import { splitByCapitalLetters } from '~/helpers/formatters';
import { IMultiSigListItem } from '../../types';
import { IHistoricalMultiSigProposals } from './constants';
import { columns } from './config';

export const useMultiSigTable = () => {
  const [proposalsList, setProposalsList] = useState<IMultiSigListItem[]>([]);
  const [tableData, setTableData] = useState<
    IHistoricalMultiSigProposals[] | []
  >([]);
  const [{ pageIndex, pageSize }, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(-1);
  const [tableLoading, setTableLoading] = useState(false);

  const {
    api: { sdk, gqlClient },
  } = useContext(PolymeshContext);

  const { accountKey, requiredSignatures, pendingProposalsLoading } =
    useMultiSigContext();

  useEffect(() => {
    if (!gqlClient || !sdk || !accountKey || pendingProposalsLoading) {
      return;
    }
    setTableLoading(true);

    (async () => {
      try {
        const {
          data: {
            multiSigProposals: { nodes, totalCount },
          },
        } = await gqlClient.query({
          query: getMultisigProposalsQuery({
            multisigId: accountKey,
            activeOnly: false,
            offset: pageIndex * pageSize,
            pageSize,
          }),
        });

        const account = await sdk.accountManagement.getAccount({
          address: accountKey,
        });

        const list = await Promise.all(
          nodes.map(async (rawProposal: IRawMultiSigProposal) => {
            const proposal = await (account as MultiSig).getProposal({
              id: new BigNumber(rawProposal.proposalId),
            });
            const { txTag, expiry, args } = await proposal.details();
            const [module, call] = txTag.split('.');

            return {
              ...rawProposal,
              args,
              call: splitByCapitalLetters(call),
              expiry,
              module: splitByCapitalLetters(module),
            };
          }),
        );
        const table = list.map(
          ({
            proposalId,
            extrinsicIdx,
            createdBlockId,
            creatorAccount,
            module,
            call,
            approvalCount,
            rejectionCount,
            datetime,
            status,
          }: IMultiSigListItem) => ({
            id: { extrinsicIdx, createdBlockId, proposalId },
            creatorAccount,
            module,
            call,
            votes: { approvalCount, rejectionCount },
            datetime,
            status,
          }),
        );
        setTotalItems(totalCount);
        setTotalPages(Math.ceil(totalCount / pageSize));
        setTableData(table);
        setProposalsList(list);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setTableLoading(false);
      }
    })();
  }, [
    gqlClient,
    accountKey,
    sdk,
    requiredSignatures,
    pageSize,
    pageIndex,
    pendingProposalsLoading,
  ]);

  const pagination = useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize],
  );

  return {
    table: useReactTable<IHistoricalMultiSigProposals>({
      data: tableData,
      columns: columns as ColumnDef<IHistoricalMultiSigProposals>[],
      state: { pagination },
      manualPagination: true,
      pageCount: totalPages,
      onPaginationChange: setPagination,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
    }),
    proposalsList,
    tableLoading: tableLoading || pendingProposalsLoading,
    totalItems,
  };
};
