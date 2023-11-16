import { useState, useEffect, useContext, useMemo, useRef } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  ColumnDef,
  PaginationState,
} from '@tanstack/react-table';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useMultiSigContext } from '~/context/MultiSigContext';
import {
  getMultisigCreationExtrinsics,
  getMultisigProposalsQuery,
} from '~/constants/queries';
import { notifyError } from '~/helpers/notifications';
import {
  IMultisigExtrinsicQueryResponse,
  IProposalQueryResponse,
} from '~/constants/queries/types';
import { splitByCapitalLetters, splitByUnderscore } from '~/helpers/formatters';
import { IMultiSigListItem } from '../../types';
import { IHistoricalMultiSigProposals } from './constants';
import { columns } from './config';
import { AccountContext } from '~/context/AccountContext';

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
    api: { gqlClient },
  } = useContext(PolymeshContext);
  const { multiSigAccount } = useContext(AccountContext);

  const { multiSigAccountKey, requiredSignatures, multiSigLoading } =
    useMultiSigContext();
  const multiSigAccountRef = useRef<string | undefined>('');

  useEffect(() => {
    if (multiSigAccount?.address !== multiSigAccountRef.current) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }
  }, [multiSigAccount]);

  useEffect(() => {
    setTableLoading(true);
    if (multiSigLoading) {
      return;
    }
    if (!gqlClient || !multiSigAccountKey || !multiSigAccount) {
      setTotalItems(0);
      setTotalPages(0);
      setTableData([]);
      setProposalsList([]);
      multiSigAccountRef.current = undefined;
      setTableLoading(false);
      return;
    }

    (async () => {
      try {
        const {
          data: {
            multiSigProposals: { nodes, totalCount },
          },
        } = await gqlClient.query<IProposalQueryResponse>({
          query: getMultisigProposalsQuery({
            multisigId: multiSigAccountKey,
            activeOnly: false,
            offset: pageIndex * pageSize,
            pageSize,
          }),
        });
        const createdExtrinsic = nodes.map((proposal) => ({
          blockId: proposal.createdBlockId,
          extrinsicIdx: proposal.extrinsicIdx,
        }));

        const {
          data: {
            extrinsics: { nodes: extrinsicQueryNodes },
          },
        } = await gqlClient.query<IMultisigExtrinsicQueryResponse>({
          query: getMultisigCreationExtrinsics(createdExtrinsic),
        });

        const list = nodes.map((rawProposal) => {
          const { createdBlockId, extrinsicIdx } = rawProposal;

          const proposal = extrinsicQueryNodes.find(
            (e) =>
              e.blockId === createdBlockId && e.extrinsicIdx === extrinsicIdx,
          );

          if (!proposal) {
            throw new Error(
              `Block ID ${rawProposal.createdBlockId}, extrinsic indx ${rawProposal.extrinsicIdx} not found`,
            );
          }

          const { params } = proposal;
          const module = params[1]?.value.call_module;
          const call = params[1]?.value.call_function;
          const callIndex = params[1]?.value.call_index;
          const expiry = params[2]?.value ? new Date(params[2]?.value) : null;
          const args = params[1]?.value.call_args;

          return {
            ...rawProposal,
            args,
            call: splitByUnderscore(call),
            expiry,
            module: splitByCapitalLetters(module),
            callIndex,
          };
        });

        const table = list.map(
          ({
            proposalId,
            extrinsicIdx,
            createdBlockId,
            creatorAccount,
            module,
            call,
            callIndex,
            approvalCount,
            rejectionCount,
            datetime,
            status,
          }: IMultiSigListItem) => ({
            id: { extrinsicIdx, createdBlockId, proposalId },
            creatorAccount,
            module,
            call,
            callIndex,
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
        setTotalItems(0);
        setTotalPages(0);
        setTableData([]);
        setProposalsList([]);
      } finally {
        setTableLoading(false);
        multiSigAccountRef.current = multiSigAccount.address;
      }
    })();
  }, [
    gqlClient,
    multiSigAccountKey,
    requiredSignatures,
    pageSize,
    pageIndex,
    multiSigAccount,
    multiSigLoading,
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
    tableLoading:
      tableLoading ||
      multiSigLoading ||
      multiSigAccount?.address !== multiSigAccountRef.current,
    totalItems,
  };
};
