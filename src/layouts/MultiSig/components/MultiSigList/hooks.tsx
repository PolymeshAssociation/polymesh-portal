import { useState, useContext, useEffect } from 'react';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { notifyError } from '~/helpers/notifications';
import { IMultiSigListItem, TMultiSigArgs } from '../../types';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { IProposalQueryResponse } from '~/constants/queries/types';
import { getMultisigProposalsQuery } from '~/helpers/graphqlQueries';
import { splitCamelCase } from '~/helpers/formatters';

export const useMultiSigList = () => {
  const [proposalsList, setProposalsList] = useState<IMultiSigListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    api: { gqlClient },
  } = useContext(PolymeshContext);
  const { multiSigAccount } = useContext(AccountContext);
  const {
    api: { polkadotApi },
    state: { middlewareMetadata },
  } = useContext(PolymeshContext);
  const {
    activeProposalsIds,
    multiSigAccountKey,
    pendingProposals,
    pendingProposalsLoading,
  } = useMultiSigContext();

  useEffect(() => {
    if (pendingProposalsLoading) {
      setIsLoading(true);
    }
  }, [pendingProposalsLoading]);

  useEffect(() => {
    if (
      pendingProposalsLoading ||
      !polkadotApi ||
      !gqlClient ||
      !middlewareMetadata
    ) {
      return;
    }
    if (
      !multiSigAccount ||
      !pendingProposals.length ||
      !activeProposalsIds.length
    ) {
      setProposalsList([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    (async () => {
      try {
        const {
          data: {
            multiSigProposals: { nodes },
          },
        } = await gqlClient.query<IProposalQueryResponse>({
          query: getMultisigProposalsQuery({
            multisigId: multiSigAccount.address,
            ids: activeProposalsIds,
            paddedIds: middlewareMetadata.paddedIds,
          }),
        });

        const list = pendingProposals.map((proposal) => {
          const currentProposal = nodes.find(
            (multiSigProposal) =>
              multiSigProposal.proposalId === proposal.id.toNumber(),
          );

          if (!currentProposal)
            throw new Error(
              `Query response not found for proposal ID ${proposal.id.toNumber()}`,
            );
          const {
            txTag,
            args,
            status,
            approvalAmount,
            rejectionAmount,
            expiry,
          } = proposal;
          const {
            createdBlock: { blockId: createdBlockId },
            creatorAccount,
            extrinsicIdx,
            updatedBlock: { blockId: updatedBlockId },
            votes,
            datetime,
          } = currentProposal;
          const [module, call] = txTag.split('.');

          return {
            expiry,
            status,
            approvalCount: approvalAmount.toNumber(),
            rejectionCount: rejectionAmount.toNumber(),
            args: args as TMultiSigArgs,
            call: splitCamelCase(call),
            proposalId: proposal.id.toNumber(),
            module: splitCamelCase(module),
            createdBlock: { blockId: createdBlockId },
            creatorAccount,
            updatedBlock: { blockId: updatedBlockId },
            extrinsicIdx,
            datetime,
            votes,
          };
        });
        setProposalsList(list);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [
    activeProposalsIds,
    gqlClient,
    middlewareMetadata,
    multiSigAccount,
    multiSigAccountKey,
    pendingProposals,
    pendingProposalsLoading,
    polkadotApi,
  ]);

  return {
    isLoading,
    proposalsList,
  };
};
