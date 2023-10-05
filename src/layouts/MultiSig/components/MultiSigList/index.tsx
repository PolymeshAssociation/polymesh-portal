import { useState, useContext } from 'react';
import {
  UnsubCallback,
  GenericPolymeshTransaction,
} from '@polymeshassociation/polymesh-sdk/types';
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
  const { refreshProposals, pendingProposals } = useMultiSigContext();
  const { proposalsList, isLoading } = useMultiSigList();

  const executeAction = async (action: EProposalAction, proposalId: number) => {
    let unsubCb: UnsubCallback | undefined;
    let unsubProcessedByMiddleware: UnsubCallback | undefined;
    try {
      setActionInProgress(true);

      const proposal = pendingProposals.find((p) => p.id.isEqualTo(proposalId));
      if (!proposal)
        throw new Error(`MultiSig proposal ID ${proposalId} not found !!!!`);

      const tx = await proposal[action]({ signingAccount: account?.address });
      unsubCb = tx.onStatusChange((transaction) =>
        handleStatusChange(transaction),
      );

      const refreshOnProcessedByMiddleware = new Promise<void>(
        (resolve, reject) => {
          unsubProcessedByMiddleware = tx.onProcessedByMiddleware((error) => {
            if (error) {
              notifyError((error as Error).message);
              reject();
            }
            refreshProposals();
            resolve();
          });
        },
      );

      const runTx = async (
        transaction: GenericPolymeshTransaction<void, void>,
      ) => {
        await transaction.run();
        setActionInProgress(false);
      };

      await Promise.all([refreshOnProcessedByMiddleware, runTx(tx)]);
    } catch (error) {
      notifyError((error as Error).message);
      setActionInProgress(false);
    } finally {
      if (unsubCb) {
        unsubCb();
      }
      if (unsubProcessedByMiddleware) {
        unsubProcessedByMiddleware();
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
