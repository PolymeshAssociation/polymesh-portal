import { useContext } from 'react';
import { AuthorizationsContext } from '~/context/AuthorizationsContext';
import { InstructionsContext } from '~/context/InstructionsContext';

const useNotifications = () => {
  const { pendingInstructions, instructionsLoading } =
    useContext(InstructionsContext);
  const {
    incomingAuthorizations: pendingAuthorizations,
    authorizationsLoading,
  } = useContext(AuthorizationsContext);

  return {
    pendingInstructions,
    pendingAuthorizations,
    totalPending: pendingInstructions.length + pendingAuthorizations.length,
    count: {
      instructions: pendingInstructions.length,
      authorizations: pendingAuthorizations.length,
    },
    notificationsLoading: instructionsLoading || authorizationsLoading,
  };
};

export default useNotifications;
