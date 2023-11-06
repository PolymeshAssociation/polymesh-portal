import { useState, useContext } from 'react';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { UnsubCallback } from '@polymeshassociation/polymesh-sdk/types';
import { MultiSig } from '@polymeshassociation/polymesh-sdk/internal';
import { AccountContext } from '~/context/AccountContext';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { useTransactionStatus } from '~/hooks/polymesh';
import { notifyError } from '~/helpers/notifications';
import { ESortOptions, EProposalAction } from '../../types';
import { MultiSigListItem } from '../MultiSigItem';
import { ItemPlaceHolder } from '../ItemPlaceHolder';
import { useMultiSigList } from './hooks';

interface IMultiSigListProps {
  sortBy: ESortOptions;
}

export const MultiSigList: React.FC<IMultiSigListProps> = ({ sortBy }) => {
  const [actionInProgress, setActionInProgress] = useState(false);

  const { account } = useContext(AccountContext);
  const { handleStatusChange } = useTransactionStatus();
  const { refreshProposals } = useMultiSigContext();
  const { proposalsList, isLoading } = useMultiSigList();

  const executeAction = async (action: EProposalAction, proposalId: number) => {
    let unsubCb: UnsubCallback | undefined;
    try {
      setActionInProgress(true);

      const proposal = await (account as MultiSig).getProposal({
        id: new BigNumber(proposalId),
      });
      const tx = await proposal[action]({ signingAccount: account?.address });
      tx.onStatusChange((transaction) => handleStatusChange(transaction));
      await tx.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setActionInProgress(false);
      refreshProposals();
      if (unsubCb) {
        unsubCb();
      }
    }
  };

  const sortedList = () => {
    switch (sortBy) {
      case ESortOptions.NEWEST:
        return proposalsList?.sort((a, b) => b.proposalId - a.proposalId);

      case ESortOptions.OLDEST:
        return proposalsList?.sort((a, b) => a.proposalId - b.proposalId);

      default:
        return proposalsList;
    }
  };

  if (!proposalsList?.length || isLoading) {
    return (
      <ItemPlaceHolder isLoading={isLoading} isEmpty={!proposalsList?.length} />
    );
  }

  return (
    proposalsList?.length &&
    sortedList().map((proposal) => (
      <MultiSigListItem
        key={proposal.proposalId}
        item={proposal}
        executeAction={executeAction}
        actionInProgress={actionInProgress}
      />
    ))
  );
};
