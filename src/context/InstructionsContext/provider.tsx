import { Instruction } from '@polymeshassociation/polymesh-sdk/types';
import { useState, useEffect, useContext, useMemo } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { notifyError } from '~/helpers/notifications';
import InstructionsContext from './context';

interface IProviderProps {
  children: React.ReactNode;
}

const InstructionsProvider = ({ children }: IProviderProps) => {
  const { identity } = useContext(AccountContext);
  const [pendingInstructions, setPendingInstructions] = useState<Instruction[]>(
    [],
  );
  const [instructionsLoading, setInstructionsLoading] = useState(false);

  useEffect(() => {
    if (!identity) return;

    (async () => {
      setInstructionsLoading(true);
      try {
        const instructions = await identity.getInstructions();
        setPendingInstructions(instructions.pending);
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setInstructionsLoading(false);
      }
    })();
  }, [identity]);

  const contextValue = useMemo(
    () => ({ pendingInstructions, instructionsLoading }),
    [pendingInstructions, instructionsLoading],
  );
  return (
    <InstructionsContext.Provider value={contextValue}>
      {children}
    </InstructionsContext.Provider>
  );
};

export default InstructionsProvider;
