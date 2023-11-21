import { useState, useContext, useEffect } from 'react';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { splitByCapitalLetters } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import { IMultiSigListItem, TMultiSigArgs } from '../../types';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { IProposalQueryResponse } from '~/constants/queries/types';
import { getMultisigProposalsQuery } from '~/helpers/graphqlQueries';

export const useMultiSigList = () => {
  const [proposalsList, setProposalsList] = useState<IMultiSigListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const {
    api: { gqlClient },
  } = useContext(PolymeshContext);
  const { multiSigAccount } = useContext(AccountContext);
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
    if (pendingProposalsLoading || !gqlClient) {
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

          const { txTag, expiry, args } = proposal;
          const [module, call] = txTag.split('.');
          return {
            ...currentProposal,
            args: args as TMultiSigArgs,
            call: splitByCapitalLetters(call),
            callIndex: '', // TODO either retrieve the call index or remove all callIndexes in tables
            expiry,
            module: splitByCapitalLetters(module),
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
  ]);

  return {
    isLoading,
    proposalsList,
  };
};
