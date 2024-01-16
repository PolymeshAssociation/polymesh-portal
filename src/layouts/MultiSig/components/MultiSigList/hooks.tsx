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
    if (pendingProposalsLoading || !polkadotApi || !gqlClient) {
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
            createdBlockId,
            creatorAccount,
            extrinsicIdx,
            updatedBlockId,
            votes,
            datetime,
          } = currentProposal;
          const [module, call] = txTag.split('.');

          const rawCallIndex = polkadotApi.tx[module][call].callIndex;
          // for consistency we use the hex representation of the call index
          const callIndex = Array.from(rawCallIndex)
            .map((entry) => entry.toString(16).padStart(2, '0'))
            .join('');

          return {
            expiry,
            status,
            approvalCount: approvalAmount.toNumber(),
            rejectionCount: rejectionAmount.toNumber(),
            args: args as TMultiSigArgs,
            call: splitCamelCase(call),
            proposalId: proposal.id.toNumber(),
            module: splitCamelCase(module),
            callIndex,
            createdBlockId,
            creatorAccount,
            updatedBlockId,
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
