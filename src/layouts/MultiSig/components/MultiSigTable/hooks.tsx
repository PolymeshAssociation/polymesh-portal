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
import { getMultisigProposalsQuery } from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import {
  ERawMultiSigStatus,
  IProposalQueryResponse,
  IMultiSigProposalArgs,
  IRawMultiSigProposal,
} from '~/constants/queries/types';
import { splitCamelCase, splitByUnderscore } from '~/helpers/formatters';
import { IMultiSigListItem } from '../../types';
import { IHistoricalMultiSigProposals } from './constants';
import { columns } from './config';
import { parseRawMultiSigProposal } from '../../helpers';
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
    state: { middlewareMetadata },
  } = useContext(PolymeshContext);
  const { multiSigAccount } = useContext(AccountContext);

  const { multiSigAccountKey, requiredSignatures, multiSigLoading } =
    useMultiSigContext();
  const multiSigAccountRef = useRef<string | undefined>('');

  const getProposalById = (proposalId: number) => {
    const currentProposal = proposalsList.find(
      (item) => item.proposalId === proposalId,
    );
    return currentProposal as IMultiSigListItem;
  };

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
    if (
      !gqlClient ||
      !multiSigAccountKey ||
      !multiSigAccount ||
      !middlewareMetadata
    ) {
      setTotalItems(0);
      setTotalPages(0);
      setTableData([]);
      setProposalsList([]);
      multiSigAccountRef.current = undefined;
      setTableLoading(false);
      return;
    }

    const mapProposal = (rawProposal: IRawMultiSigProposal) => {
      const extrinsicArgs = rawProposal.createdEvent.extrinsic
        ?.args as IMultiSigProposalArgs | null;

      // Proposals made by another call, such as a bridge batch, carry no
      // `proposal` argument
      const {
        section = '',
        method = '',
        args = {},
      } = extrinsicArgs?.proposal ?? {};
      const expiry = extrinsicArgs?.expiry
        ? new Date(Number(extrinsicArgs.expiry))
        : null;

      return {
        ...parseRawMultiSigProposal(rawProposal),
        args,
        call: splitByUnderscore(method),
        expiry,
        module: splitCamelCase(section),
      };
    };

    (async () => {
      try {
        const {
          data: {
            multiSigProposals: { nodes, totalCount },
          },
        } = await gqlClient.query<IProposalQueryResponse>({
          query: getMultisigProposalsQuery({
            multisigId: multiSigAccountKey,
            offset: pageIndex * pageSize,
            pageSize,
            isHistorical: true,
          }),
        });

        const list: IMultiSigListItem[] = nodes.map(mapProposal);
        const table = list.map(
          ({
            proposalId,
            extrinsicIdx,
            createdBlock: { blockId },
            creatorAccount,
            module,
            call,
            approvalCount,
            rejectionCount,
            datetime,
            status,
          }: IMultiSigListItem) => ({
            id: {
              extrinsicIdx,
              createdBlockId: blockId.toString(),
              proposalId,
            },
            creatorAccount,
            module,
            call,
            votes: { approvalCount, rejectionCount },
            datetime,
            status: status as ERawMultiSigStatus,
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
    middlewareMetadata,
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
    getProposalById,
  };
};
