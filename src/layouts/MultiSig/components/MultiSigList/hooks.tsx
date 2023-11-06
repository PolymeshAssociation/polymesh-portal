import { useState, useContext, useEffect } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { MultiSig } from '@polymeshassociation/polymesh-sdk/internal';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { splitByCapitalLetters } from '~/helpers/formatters';
import { notifyError } from '~/helpers/notifications';
import { IMultiSigListItem, TMultiSigArgs } from '../../types';

export const useMultiSigList = () => {
  const [proposalsList, setProposalsList] = useState<IMultiSigListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const {
    api: { polkadotApi, sdk },
  } = useContext(PolymeshContext);
  const { accountKey, pendingProposals, pendingProposalsLoading } =
    useMultiSigContext();

  useEffect(() => {
    if (pendingProposalsLoading) {
      setIsLoading(true);
    }
  }, [pendingProposalsLoading]);

  useEffect(() => {
    if (
      pendingProposalsLoading ||
      !pendingProposals?.length ||
      !polkadotApi ||
      !sdk
    ) {
      return;
    }
    setIsLoading(true);

    (async () => {
      try {
        const account = await sdk?.accountManagement.getAccount({
          address: accountKey,
        });
        const list = await Promise.all(
          pendingProposals.map(async (rawProposal) => {
            const proposal = await (account as MultiSig).getProposal({
              id: new BigNumber(rawProposal.proposalId),
            });
            const { txTag, expiry, args } = await proposal.details();
            const [module, call] = txTag.split('.');
            return {
              ...rawProposal,
              args: args as TMultiSigArgs,
              call: splitByCapitalLetters(call),
              expiry,
              module: splitByCapitalLetters(module),
            };
          }),
        );

        setProposalsList(list);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setIsLoading(false);
      }
    })();
  }, [accountKey, pendingProposals, pendingProposalsLoading, polkadotApi, sdk]);

  return {
    isLoading,
    proposalsList,
  };
};
