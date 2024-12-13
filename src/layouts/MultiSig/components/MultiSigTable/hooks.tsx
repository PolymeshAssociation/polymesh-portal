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
} from '~/helpers/graphqlQueries';
import { notifyError } from '~/helpers/notifications';
import {
  ERawMultiSigStatus,
  IMultisigExtrinsicQueryResponse,
  IProposalQueryResponse,
  IMultiSigProposalParams,
  IRawMultiSigProposal,
} from '~/constants/queries/types';
import { splitCamelCase, splitByUnderscore } from '~/helpers/formatters';
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

    const mapProposal = (
      rawProposal: IRawMultiSigProposal,
      params: IMultiSigProposalParams,
    ) => {
      const module = params.proposal.section;
      const call = params.proposal.method;
      const expiry = params.expiry ? new Date(params.expiry) : null;
      const { args } = params.proposal;

      return {
        ...rawProposal,
        args,
        call: splitByUnderscore(call),
        expiry,
        module: splitCamelCase(module),
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
            paddedIds: middlewareMetadata.paddedIds,
          }),
        });

        let list: IMultiSigListItem[];
        if (!middlewareMetadata.paddedIds) {
          const createdExtrinsics = nodes.map((proposal) => ({
            blockId: proposal.createdBlock.blockId,
            extrinsicIdx: proposal.extrinsicIdx,
          }));

          const {
            data: {
              extrinsics: { nodes: extrinsicQueryNodes },
            },
          } = await gqlClient.query<IMultisigExtrinsicQueryResponse>({
            query: getMultisigCreationExtrinsics({
              extrinsicArray: createdExtrinsics,
            }),
          });

          list = nodes.map((rawProposal) => {
            const {
              createdBlock: { blockId: createdBlockId },
              extrinsicIdx,
            } = rawProposal;

            const proposal = extrinsicQueryNodes.find(
              (e) =>
                e.block.blockId === createdBlockId &&
                e.extrinsicIdx === extrinsicIdx,
            );

            if (!proposal) {
              throw new Error(
                `Block ID ${rawProposal.createdBlock.blockId}, extrinsic index ${rawProposal.extrinsicIdx} not found`,
              );
            }

            return mapProposal(rawProposal, proposal.params);
          });
        } else {
          list = nodes.map((rawProposal) => {
            const { createdEvent } = rawProposal;

            if (!createdEvent) {
              throw new Error(
                `Created event not found for proposal ID ${rawProposal.proposalId}`,
              );
            }

            return mapProposal(rawProposal, createdEvent.extrinsic.params);
          });
        }
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
