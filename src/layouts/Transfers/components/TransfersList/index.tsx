import { useContext, useState } from 'react';
import {
  Instruction,
  NoArgsProcedureMethod,
  UnsubCallback,
} from '@polymeshassociation/polymesh-sdk/types';
import { InstructionsContext } from '~/context/InstructionsContext';
import { AccountContext } from '~/context/AccountContext';
import { useTransactionStatus } from '~/hooks/polymesh';
import { Icon } from '~/components';
import {
  StyledSelectionWrapper,
  SelectAllButton,
  StyledSelected,
  StyledTransfersList,
  StyledButtonWrapper,
  StyledActionButton,
  ClearSelectionButton,
  TransfersPlaceholder,
} from './styles';
import { TransferItem } from '../TransferItem';
import { notifyError } from '~/helpers/notifications';

export const TransfersList = () => {
  const [selectedItems, setSelectedItems] = useState<Instruction[]>([]);
  const { identityLoading } = useContext(AccountContext);
  const { pendingInstructions, instructionsLoading } =
    useContext(InstructionsContext);
  const { handleStatusChange } = useTransactionStatus();
  const [actionInProgress, setActionInProgress] = useState(false);

  const handleItemSelect = (selectedInstruction: Instruction) => {
    setSelectedItems((prev) => {
      if (!prev.length) {
        return [selectedInstruction];
      }
      if (
        prev.some(
          (instruction) =>
            instruction.toHuman() === selectedInstruction.toHuman(),
        )
      ) {
        return prev.filter(
          (instruction) =>
            instruction.toHuman() !== selectedInstruction.toHuman(),
        );
      }
      return [...prev, selectedInstruction];
    });
  };

  const handleSelectAll = () => {
    setSelectedItems(pendingInstructions);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const executeAction = async (
    action: NoArgsProcedureMethod<Instruction, Instruction>,
  ) => {
    let unsubCb: UnsubCallback | undefined;
    try {
      setActionInProgress(true);
      const tx = await action();
      unsubCb = await tx.onStatusChange(handleStatusChange);
      await tx.run();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setActionInProgress(false);
      if (unsubCb) {
        unsubCb();
      }
    }
  };

  return (
    <>
      <StyledSelectionWrapper>
        <SelectAllButton
          onClick={handleSelectAll}
          disabled={!pendingInstructions.length}
        >
          Select All
        </SelectAllButton>
        {!!selectedItems.length && (
          <StyledButtonWrapper>
            <StyledActionButton isReject disabled={actionInProgress}>
              <Icon name="CloseIcon" size="24px" />
              Reject
            </StyledActionButton>
            <StyledActionButton disabled={actionInProgress}>
              <Icon name="Check" size="24px" />
              Approve
            </StyledActionButton>
          </StyledButtonWrapper>
        )}
        <StyledSelected>
          Selected: <span>{selectedItems.length}</span>
          {!!selectedItems.length && (
            <ClearSelectionButton onClick={clearSelection}>
              <Icon name="CloseIcon" size="16px" />
            </ClearSelectionButton>
          )}
        </StyledSelected>
      </StyledSelectionWrapper>
      {identityLoading || instructionsLoading ? (
        <TransfersPlaceholder>Loading</TransfersPlaceholder>
      ) : (
        <StyledTransfersList>
          {pendingInstructions.length ? (
            pendingInstructions.map((instruction) => (
              <TransferItem
                key={instruction.toHuman()}
                instruction={instruction}
                onSelect={() => handleItemSelect(instruction)}
                isSelected={selectedItems.some(
                  (item) => item.toHuman() === instruction.toHuman(),
                )}
                executeAction={executeAction}
                actionInProgress={actionInProgress}
              />
            ))
          ) : (
            <TransfersPlaceholder>No data available</TransfersPlaceholder>
          )}
        </StyledTransfersList>
      )}
    </>
  );
};
