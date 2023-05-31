import { useContext } from 'react';
import { AuthorizationsContext } from '~/context/AuthorizationsContext';
import { DistributionsContext } from '~/context/DistributionsContext';
import { InstructionsContext } from '~/context/InstructionsContext';

const useNotifications = () => {
  const { pendingInstructions, instructionsLoading } =
    useContext(InstructionsContext);
  const {
    incomingAuthorizations: pendingAuthorizations,
    authorizationsLoading,
  } = useContext(AuthorizationsContext);
  const { pendingDistributions, distributionsLoading } =
    useContext(DistributionsContext);

  return {
    pendingInstructions,
    pendingAuthorizations,
    pendingDistributions,
    totalPending:
      pendingInstructions.length +
      pendingAuthorizations.length +
      pendingDistributions.length,
    count: {
      instructions: pendingInstructions.length,
      authorizations: pendingAuthorizations.length,
      distributions: pendingDistributions.length,
    },
    notificationsLoading:
      instructionsLoading || authorizationsLoading || distributionsLoading,
  };
};

export default useNotifications;
