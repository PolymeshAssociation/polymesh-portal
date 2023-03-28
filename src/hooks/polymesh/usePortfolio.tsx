import { NumberedPortfolio as NumberedPortfolioClass } from '@polymeshassociation/polymesh-sdk/internal';
import {
  DefaultPortfolio,
  MoveFundsParams,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext, useState } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { notifyError, notifyWarning } from '~/helpers/notifications';
import { useTransactionStatus } from '~/hooks/polymesh';

const usePortfolio = (
  portfolio: DefaultPortfolio | NumberedPortfolio | undefined,
) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);
  const { getPortfoliosData } = useContext(PortfolioContext);
  const { handleStatusChange } = useTransactionStatus();
  const [actionInProgress, setActionInProgress] = useState(false);

  const moveAssets = async (data: MoveFundsParams) => {
    if (!identity || !portfolio) return;

    try {
      const moveQ = await portfolio.moveFunds(data);
      moveQ.onStatusChange(handleStatusChange);
      await moveQ.run();
      await getPortfoliosData();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setActionInProgress(false);
    }
  };

  const createPortfolio = async (name: string) => {
    if (!sdk) return;

    setActionInProgress(true);
    try {
      const createQ = await sdk.identities.createPortfolio({ name });
      createQ.onStatusChange(handleStatusChange);
      await createQ.run();
      await getPortfoliosData();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setActionInProgress(false);
    }
  };

  const editPortfolio = async (newName: string) => {
    if (!identity || !portfolio) return;

    if (portfolio instanceof NumberedPortfolioClass) {
      setActionInProgress(true);
      try {
        const editQ = await portfolio.modifyName({
          name: newName,
        });
        editQ.onStatusChange(handleStatusChange);
        await editQ.run();
        await getPortfoliosData();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setActionInProgress(false);
      }
    } else {
      notifyWarning('You cannot edit this portfolio');
    }
  };

  const deletePortfolio = async () => {
    if (!identity || !portfolio) return;

    if (portfolio instanceof NumberedPortfolioClass) {
      setActionInProgress(true);
      try {
        const deleteQ = await identity.portfolios.delete({
          portfolio,
        });
        deleteQ.onStatusChange(handleStatusChange);
        await deleteQ.run();
        await getPortfoliosData();
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setActionInProgress(false);
      }
    } else {
      notifyWarning('You cannot delete this portfolio');
    }
  };
  return {
    moveAssets,
    createPortfolio,
    editPortfolio,
    deletePortfolio,
    actionInProgress,
  };
};

export default usePortfolio;
