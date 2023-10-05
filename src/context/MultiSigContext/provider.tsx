import { useState, useEffect, useContext, useMemo, ReactNode } from 'react';
import {
  Account,
  MultiSigDetails,
  ProposalStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import { MultiSigProposal } from '@polymeshassociation/polymesh-sdk/internal';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';
import MultiSigContext from './context';
import { ProposalWithDetails } from './constants';

interface IMultiSigProviderProps {
  children: ReactNode;
}

const MultiSigProvider = ({ children }: IMultiSigProviderProps) => {
  const [pendingProposals, setPendingProposals] = useState<
    ProposalWithDetails[]
  >([]);
  const [activeProposalsIds, setActiveProposalIds] = useState<number[]>([]);
  const [unsignedProposals, setUnsignedProposals] = useState<number[]>([]);
  const [pendingProposalsLoading, setPendingProposalsLoading] = useState(false);
  const [shouldRefreshData, setShouldRefreshData] = useState(true);
  const [multisigDetails, setMultisigDetails] =
    useState<MultiSigDetails | null>(null);
  const [multiSigLoading, setMultiSigLoading] = useState(true);
  const [multiSigDetailsLoading, setMultiSigDetailsLoading] = useState(false);
  const {
    api: { sdk, gqlClient },
  } = useContext(PolymeshContext);

  const {
    accountIsMultisigSigner,
    accountLoading,
    account: currentAccount,
    multiSigAccount,
  } = useContext(AccountContext);

  const refreshProposals = () => {
    setShouldRefreshData(true);
  };

  useEffect(() => {
    if (accountLoading || shouldRefreshData) {
      setMultiSigLoading(true);
    }
  }, [accountLoading, shouldRefreshData]);

  useEffect(() => {
    setMultiSigLoading(multiSigDetailsLoading || pendingProposalsLoading);
  }, [multiSigDetailsLoading, pendingProposalsLoading]);

  useEffect(() => {
    if (accountLoading || !multiSigAccount) {
      setMultisigDetails(null);
      setMultiSigDetailsLoading(accountLoading || false);
      return;
    }

    (async () => {
      try {
        const details = await multiSigAccount.details();
        setMultisigDetails(details);
      } catch (error) {
        notifyError((error as Error).message);
        setMultisigDetails(null);
      } finally {
        setMultiSigDetailsLoading(false);
      }
    })();
  }, [accountLoading, multiSigAccount]);

  useEffect(() => {
    if (
      accountLoading ||
      !accountIsMultisigSigner ||
      !sdk ||
      !gqlClient ||
      !multiSigAccount?.address ||
      !currentAccount
    ) {
      setPendingProposals([]);
      setUnsignedProposals([]);
      setActiveProposalIds([]);
      setShouldRefreshData(true);
      setPendingProposalsLoading(accountLoading || false);
      return;
    }

    if (!shouldRefreshData) {
      return;
    }

    async function filterProposalsToActive(
      proposals: MultiSigProposal[],
    ): Promise<ProposalWithDetails[]> {
      const proposalsWithDetails = await Promise.all(
        proposals.map(async (proposal) => {
          const detailsResult = await proposal.details();
          const proposalWithDetails: ProposalWithDetails = Object.assign(
            Object.create(Object.getPrototypeOf(proposal)),
            proposal,
            detailsResult,
          );

          return proposalWithDetails;
        }),
      );
      const activeProposalsWithDetails = proposalsWithDetails.filter(
        ({ status }) => {
          return status === ProposalStatus.Active;
        },
      );

      return activeProposalsWithDetails;
    }

    setPendingProposalsLoading(true);

    (async () => {
      try {
        const proposals = await multiSigAccount.getProposals();
        const activeProposalsWithDetails =
          await filterProposalsToActive(proposals);
        const activeProposals = activeProposalsWithDetails.map((proposal) =>
          proposal.id.toNumber(),
        );

        const proposalsNotVoted = activeProposalsWithDetails.reduce(
          (acc: number[], proposalWithDetails: ProposalWithDetails) => {
            if (
              !proposalWithDetails.voted.some(
                (votedAccount: Account) =>
                  votedAccount.address === currentAccount.address,
              )
            ) {
              acc.push(proposalWithDetails.id.toNumber());
            }
            return acc;
          },
          [],
        );

        setUnsignedProposals(proposalsNotVoted);
        setActiveProposalIds(activeProposals);
        setPendingProposals(activeProposalsWithDetails);
      } catch (error) {
        notifyError((error as Error).message);
        setUnsignedProposals([]);
        setActiveProposalIds([]);
        setPendingProposals([]);
      } finally {
        setPendingProposalsLoading(false);
        setShouldRefreshData(false);
      }
    })();
  }, [
    accountIsMultisigSigner,
    accountLoading,
    currentAccount,
    gqlClient,
    sdk,
    shouldRefreshData,
    multiSigAccount,
  ]);

  const contextValue = useMemo(
    () => ({
      activeProposalsIds,
      multiSigAccountKey: multiSigAccount?.address || '',
      multiSigLoading,
      pendingProposals,
      pendingProposalsLoading,
      refreshProposals,
      requiredSignatures: multisigDetails?.requiredSignatures.toNumber() || 0,
      signers: (multisigDetails?.signers || []).map(
        (signer) => (signer as Account).address,
      ),
      unsignedProposals,
    }),
    [
      activeProposalsIds,
      multiSigAccount?.address,
      multiSigLoading,
      multisigDetails,
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
