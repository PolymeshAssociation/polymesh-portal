import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { EProposalAction, ESortOptions } from '../../types';
import { ItemPlaceHolder } from '../ItemPlaceHolder';
import { MultiSigListItem } from '../MultiSigItem';
import { useMultiSigList } from './hooks';

interface IMultiSigListProps {
  sortBy: ESortOptions;
}

export const MultiSigList: React.FC<IMultiSigListProps> = ({ sortBy }) => {
  const { account } = useContext(AccountContext);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();
  const { refreshProposals, pendingProposals } = useMultiSigContext();
  const { proposalsList, isLoading } = useMultiSigList();

  const executeAction = async (action: EProposalAction, proposalId: number) => {
    try {
      const proposal = pendingProposals.find((p) => p.id.isEqualTo(proposalId));
      if (!proposal)
        throw new Error(`MultiSig proposal ID ${proposalId} not found !!!!`);

      const tx = await proposal[action]({ signingAccount: account?.address });

      // Execute transaction with global status handling including middleware
      await executeTransaction(Promise.resolve(tx), {
        runAsMultiSigProposal: 'never', // always run as a signer
        onProcessedByMiddleware: () => {
          refreshProposals();
        },
        onSuccess: () => {
          // Transaction success is handled by middleware
        },
      });
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
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
        actionInProgress={isTransactionInProgress}
      />
    ))
  );
};
