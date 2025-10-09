import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { notifyError } from '~/helpers/notifications';
import { useBalance } from '~/hooks/polymesh';

export interface ITransfer {
  amount: string;
  to: string;
  memo?: string;
}

export interface IUseTransferPolyxOptions {
  /**
   * If true, uses the multisig account balance and creates a proposal to transfer from multisig.
   * If false or undefined, uses the signing key's balance and transfers directly (never creates proposal).
   * @default false
   */
  useMultisigAccount?: boolean;
}

const useTransferPolyx = (options: IUseTransferPolyxOptions = {}) => {
  const { useMultisigAccount = false } = options;
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { selectedAccount, multiSigAccount, accountLoading } =
    useContext(AccountContext);
  const { executeTransaction, isTransactionInProgress } =
    useTransactionStatusContext();

  // Determine which account to use for balance and transfers
  const sourceAccount = useMultisigAccount
    ? multiSigAccount?.address
    : selectedAccount;
  const isMultisigTransfer = useMultisigAccount && !!multiSigAccount;

  // When in multisig mode, wait for multisig account to be available
  const isWaitingForMultisig =
    useMultisigAccount && !multiSigAccount && accountLoading;

  // Use the existing useBalance hook to get balance data
  const { balance, balanceIsLoading } = useBalance(sourceAccount);

  // Convert balance strings to BigNumber for compatibility
  const { availableBalance, lockedBalance, totalBalance } = useMemo(
    () => ({
      availableBalance: new BigNumber(balance.free || 0),
      lockedBalance: new BigNumber(balance.locked || 0),
      totalBalance: new BigNumber(balance.total || 0),
    }),
    [balance.free, balance.locked, balance.total],
  );

  const [maxTransferablePolyx, setMaxTransferablePolyx] = useState<BigNumber>(
    new BigNumber(0),
  );
  const [maxTransferablePolyxWithMemo, setMaxTransferablePolyxWithMemo] =
    useState<BigNumber>(new BigNumber(0));

  // Calculate max transferable based on available balance
  useEffect(() => {
    // Don't calculate if we're waiting for the multisig account to load
    if (isWaitingForMultisig || balanceIsLoading) return undefined;

    if (!sdk || !sourceAccount || !availableBalance) return undefined;

    let isMounted = true;

    const calculateMaxTransferable = async () => {
      const getMaxTransferablePolyx = async (
        withMemo?: boolean,
      ): Promise<BigNumber> => {
        try {
          const transferTx = await sdk.network.transferPolyx(
            {
              amount: availableBalance,
              to: sourceAccount,
              memo: withMemo ? 'Dummy memo' : undefined,
            },
            { signingAccount: selectedAccount },
          );

          const transferFees = await transferTx.getTotalFees();

          const transferFee = transferFees.fees.total;
          const payingAccount = transferFees.payingAccountData.account.address;

          // If the account is subsidized or has a payer, payingAccount will differ from sourceAccount
          const max =
            payingAccount === sourceAccount
              ? BigNumber.max(
                  availableBalance.minus(transferFee),
                  new BigNumber(0),
                )
              : availableBalance;

          return max;
        } catch (error) {
          // If fee estimation fails, use the full available balance
          return availableBalance;
        }
      };

      try {
        const [maxTransferable, maxTransferableWithMemo] = await Promise.all([
          getMaxTransferablePolyx(),
          getMaxTransferablePolyx(true),
        ]);

        // Only update state if component is still mounted and dependencies haven't changed
        if (isMounted) {
          setMaxTransferablePolyx(maxTransferable);
          setMaxTransferablePolyxWithMemo(maxTransferableWithMemo);
        }
      } catch (error) {
        if (isMounted) {
          setMaxTransferablePolyx(availableBalance);
          setMaxTransferablePolyxWithMemo(availableBalance);

          notifyError(
            'Error estimating transaction fee. The max transferable amount does not account for transaction fees',
          );
        }
      }
    };

    calculateMaxTransferable();

    return () => {
      isMounted = false;
    };
  }, [
    sdk,
    sourceAccount,
    availableBalance,
    isWaitingForMultisig,
    balanceIsLoading,
    selectedAccount,
  ]);

  const checkAddressValidity = useCallback(
    (address: string) => {
      if (!sdk) return false;

      try {
        const isValid = sdk.accountManagement.isValidAddress({ address });
        return isValid;
      } catch (error) {
        return false;
      }
    },
    [sdk],
  );

  // Emit single transaction
  const transferPolyx = useCallback(
    async ({ amount, to, memo }: ITransfer) => {
      if (!sdk) {
        notifyError('SDK not available');
        return;
      }

      try {
        await executeTransaction(
          sdk.network.transferPolyx({
            amount: new BigNumber(amount),
            to,
            memo,
          }),
          {
            // For multisig: run as proposal (creates a proposal to transfer from multisig)
            // For regular key: never run as proposal (direct transfer from signing key)
            runAsMultiSigProposal: isMultisigTransfer ? 'always' : 'never',
            onTransactionRunning: () => {
              // Optional: Handle transaction running state
            },
            onSuccess: () => {
              // Optional: Handle success
            },
            onError: (/* error: Error */) => {
              // Optional: Handle error
            },
          },
        );
      } catch (error) {
        // Error is already handled by the transaction context and notified to the user
        // This catch block prevents unhandled promise rejection
      }
    },
    [sdk, isMultisigTransfer, executeTransaction],
  );

  return useMemo(
    () => ({
      availableBalance,
      lockedBalance,
      totalBalance,
      transferPolyx,
      transactionInProcess: isTransactionInProgress,
      selectedAccount,
      checkAddressValidity,
      maxTransferablePolyx,
      maxTransferablePolyxWithMemo,
      sourceAccount: sourceAccount || '',
      isMultisigTransfer,
      isLoading: isWaitingForMultisig || balanceIsLoading,
    }),
    [
      availableBalance,
      lockedBalance,
      totalBalance,
      transferPolyx,
      isTransactionInProgress,
      selectedAccount,
      checkAddressValidity,
      maxTransferablePolyx,
      maxTransferablePolyxWithMemo,
      sourceAccount,
      isMultisigTransfer,
      isWaitingForMultisig,
      balanceIsLoading,
    ],
  );
};

export default useTransferPolyx;
