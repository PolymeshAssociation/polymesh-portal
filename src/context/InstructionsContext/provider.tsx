import {
  GroupedInstructions,
  Instruction,
  Venue,
} from '@polymeshassociation/polymesh-sdk/types';
import { useState, useEffect, useContext, useMemo } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';
import InstructionsContext from './context';

interface IProviderProps {
  children: React.ReactNode;
}

const InstructionsProvider = ({ children }: IProviderProps) => {
  const { identity, identityLoading } = useContext(AccountContext);
  const [allInstructions, setAllInstructions] =
    useState<GroupedInstructions | null>(null);
  const [pendingInstructions, setPendingInstructions] = useState<Instruction[]>(
    [],
  );
  const [createdVenues, setCreatedVenues] = useState<Venue[]>([]);
  const [instructionsLoading, setInstructionsLoading] = useState(true);
  const [shouldRefreshData, setShouldRefreshData] = useState(true);

  useEffect(() => {
    if (identityLoading || !identity) {
      setShouldRefreshData(true);
      return;
    }

    if (!shouldRefreshData) {
      return;
    }

    (async () => {
      setInstructionsLoading(true);
      try {
        const instructions = await identity.getInstructions();
        const venues = await identity.getVenues();
        setAllInstructions(instructions);
        setPendingInstructions(instructions.pending);
        setCreatedVenues(venues);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setInstructionsLoading(false);
        setShouldRefreshData(false);
      }
    })();
  }, [identity, identityLoading, shouldRefreshData]);

  const refreshInstructions = () => {
    setShouldRefreshData(true);
  };

  const contextValue = useMemo(
    () => ({
      allInstructions,
      pendingInstructions,
      createdVenues,
      instructionsLoading,
      refreshInstructions,
    }),
    [allInstructions, pendingInstructions, createdVenues, instructionsLoading],
  );
  return (
    <InstructionsContext.Provider value={contextValue}>
      {children}
    </InstructionsContext.Provider>
  );
};

export default InstructionsProvider;
