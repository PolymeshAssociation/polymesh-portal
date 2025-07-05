import { NumberedPortfolio as NumberedPortfolioClass } from '@polymeshassociation/polymesh-sdk/internal';
import {
  DefaultPortfolio,
  MoveFundsParams,
  NumberedPortfolio,
} from '@polymeshassociation/polymesh-sdk/types';
import { useContext } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { PortfolioContext } from '~/context/PortfolioContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { notifyError, notifyWarning } from '~/helpers/notifications';

const usePortfolio = (
  portfolio: DefaultPortfolio | NumberedPortfolio | undefined,
) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);
  const { getPortfoliosData } = useContext(PortfolioContext);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();

  const moveAssets = async (data: MoveFundsParams) => {
    if (!identity || !portfolio) {
      notifyError('Identity or portfolio not available');
      return;
    }
    try {
      await executeTransaction(portfolio.moveFunds(data), {
        onSuccess: async () => {
          await getPortfoliosData();
        },
      });
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const createPortfolio = async (name: string) => {
    if (!sdk) {
      notifyError('SDK not available');
      return;
    }
    try {
      await executeTransaction(sdk.identities.createPortfolio({ name }), {
        onSuccess: async () => {
          await getPortfoliosData();
        },
      });
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const editPortfolio = async (newName: string) => {
    if (!identity || !portfolio) {
      notifyError('Identity or portfolio not available');
      return;
    }
    if (portfolio instanceof NumberedPortfolioClass) {
      try {
        await executeTransaction(portfolio.modifyName({ name: newName }), {
          onSuccess: async () => {
            await getPortfoliosData();
          },
        });
      } catch (error) {
        // Error is already handled by the transaction context and notified to the user
        // This catch block prevents unhandled promise rejection
      }
    } else {
      notifyWarning('You cannot edit this portfolio');
    }
  };

  const deletePortfolio = async () => {
    if (!identity || !portfolio) {
      notifyError('Identity or portfolio not available');
      return;
    }

    if (portfolio instanceof NumberedPortfolioClass) {
      try {
        await executeTransaction(identity.portfolios.delete({ portfolio }), {
          onSuccess: async () => {
            await getPortfoliosData();
          },
        });
      } catch (error) {
        // Error is already handled by the transaction context and notified to the user
        // This catch block prevents unhandled promise rejection
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
    isTransactionInProgress,
  };
};

export default usePortfolio;
