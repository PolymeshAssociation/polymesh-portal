import { useContext } from 'react';
import { AuthorizationsContext } from '~/context/AuthorizationsContext';
import { DistributionsContext } from '~/context/DistributionsContext';
import { InstructionsContext } from '~/context/InstructionsContext';
import { useMultiSigContext } from '~/context/MultiSigContext';

const useNotifications = () => {
  const { pendingInstructions, instructionsLoading } =
    useContext(InstructionsContext);
  const {
    incomingAuthorizations: pendingAuthorizations,
    authorizationsLoading,
  } = useContext(AuthorizationsContext);
  const { pendingDistributions, distributionsLoading } =
    useContext(DistributionsContext);
  const { unsignedProposals, pendingProposalsLoading } = useMultiSigContext();

  return {
    pendingInstructions,
    pendingAuthorizations,
    pendingDistributions,
    unsignedProposals,
    totalPending:
      pendingInstructions.length +
      pendingAuthorizations.length +
      pendingDistributions.length +
      unsignedProposals.length,
    count: {
      instructions: pendingInstructions.length,
      authorizations: pendingAuthorizations.length,
      distributions: pendingDistributions.length,
      proposals: unsignedProposals.length,
    },
    notificationsLoading:
      instructionsLoading ||
      authorizationsLoading ||
      distributionsLoading ||
      pendingProposalsLoading,
  };
};

export default useNotifications;
