import { useState, useEffect, useContext, useMemo, ReactNode } from 'react';
import { Account } from '@polymeshassociation/polymesh-sdk/types';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import { getMultisigProposalsQuery } from '~/constants/queries';
import {
  IRawMultiSigProposal,
  IRawMultiSigVote,
} from '~/constants/queries/types';
import MultiSigContext from './context';

interface IMultiSigProviderProps {
  children: ReactNode;
}

const MultiSigProvider = ({ children }: IMultiSigProviderProps) => {
  const [pendingProposals, setPendingProposals] = useState<
    IRawMultiSigProposal[]
  >([]);
  const [unsignedProposals, setUnsignedProposals] = useState<number[]>([]);
  const [pendingProposalsLoading, setPendingProposalsLoading] = useState(true);
  const [shouldRefreshData, setShouldRefreshData] = useState(true);

  const {
    api: { sdk, gqlClient },
  } = useContext(PolymeshContext);

  const {
    accountIsMultisigSigner,
    allKeyInfo,
    accountLoading,
    account: currentAccount,
  } = useContext(AccountContext);

  const currentMultiSigAccount = allKeyInfo.find((acc) => acc.isMultiSig);

  const refreshProposals = () => {
    setShouldRefreshData(true);
  };

  useEffect(() => {
    if (accountLoading || !accountIsMultisigSigner) {
      setPendingProposals([]);
      setUnsignedProposals([]);
      setShouldRefreshData(true);
    }

    if (!shouldRefreshData || !sdk || !gqlClient || !currentAccount) {
      return;
    }

    if (
      !accountLoading &&
      shouldRefreshData &&
      accountIsMultisigSigner &&
      currentMultiSigAccount?.key
    ) {
      setPendingProposalsLoading(true);
      (async () => {
        try {
          const {
            data: {
              multiSigProposals: { nodes },
            },
          } = await gqlClient.query({
            query: getMultisigProposalsQuery({
              multisigId: currentMultiSigAccount.key,
            }),
          });
          const newProposals = nodes.reduce(
            (acc: number[], node: IRawMultiSigProposal) => {
              const unsigned = node.votes.nodes.filter(
                (vote: IRawMultiSigVote) =>
                  vote.signer.signerValue !== currentAccount.address,
              );
              return !unsigned?.length ? acc : [...acc, node.proposalId];
            },
            [],
          );
          if (newProposals?.length) {
            setUnsignedProposals(newProposals);
          }
          setPendingProposals(nodes);
        } catch (error) {
          notifyError((error as Error).message);
        } finally {
          setPendingProposalsLoading(false);
          setShouldRefreshData(false);
        }
      })();
    }
  }, [
    accountIsMultisigSigner,
    accountLoading,
    currentAccount,
    currentMultiSigAccount?.key,
    gqlClient,
    sdk,
    shouldRefreshData,
  ]);

  const contextValue = useMemo(
    () => ({
      accountKey: currentMultiSigAccount?.key || '',
      pendingProposals,
      pendingProposalsLoading,
      refreshProposals,
      requiredSignatures:
        currentMultiSigAccount?.multisigDetails?.requiredSignatures.toNumber() ||
        0,
      signers: (currentMultiSigAccount?.multisigDetails?.signers || []).map(
        (signer) => (signer as Account).address,
      ),
      unsignedProposals,
    }),
    [
      currentMultiSigAccount,
      pendingProposals,
      pendingProposalsLoading,
      unsignedProposals,
    ],
  );

  return (
    <MultiSigContext.Provider value={contextValue}>
      {children}
    </MultiSigContext.Provider>
  );
};

export default MultiSigProvider;
