import { useContext, useEffect, useRef, useState } from 'react';
import {
  Instruction,
  NoArgsProcedureMethod,
  UnsubCallback,
  GroupedInstructions,
} from '@polymeshassociation/polymesh-sdk/types';
import { useSearchParams } from 'react-router-dom';
import { InstructionsContext } from '~/context/InstructionsContext';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
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
import { EInstructionTypes, EActionTypes } from '../../types';
import { createTransactions } from './helpers';

export const TransfersList = () => {
  const [selectedItems, setSelectedItems] = useState<Instruction[]>([]);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identityLoading } = useContext(AccountContext);
  const { allInstructions, instructionsLoading, refreshInstructions } =
    useContext(InstructionsContext);
  const { handleStatusChange } = useTransactionStatus();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const typeRef = useRef<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);

  const currentTabInstructions =
    !allInstructions || !type
      ? null
      : allInstructions[type as keyof GroupedInstructions];

  useEffect(() => {
    if (!selectedItems.length || typeRef.current === type) return;

    setSelectedItems([]);
  }, [type, selectedItems]);

  const handleItemSelect = (selectedInstruction: Instruction) => {
    typeRef.current = type;
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
    if (!allInstructions) return;
    typeRef.current = type;
    setSelectedItems(allInstructions[type as keyof GroupedInstructions]);
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const executeBatch = async (action: `${EActionTypes}`) => {
    if (!sdk) return;

    let unsubCb: UnsubCallback | undefined;

    try {
      setActionInProgress(true);
      const transactions = await createTransactions(action, selectedItems);

      if (!transactions) return;

      const batch = await sdk.createTransactionBatch({
        transactions,
      });
      unsubCb = await batch.onStatusChange(handleStatusChange);
      await batch.run();
      clearSelection();
      refreshInstructions();
    } catch (error) {
      notifyError((error as Error).message);
    } finally {
      setActionInProgress(false);
      if (unsubCb) {
        unsubCb();
      }
    }
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
      refreshInstructions();
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
          disabled={!!currentTabInstructions && !currentTabInstructions.length}
        >
          Select All
        </SelectAllButton>
        {!!selectedItems.length && (
          <StyledButtonWrapper>
            {type === EInstructionTypes.AFFIRMED ||
              (type === EInstructionTypes.PENDING && (
                <StyledActionButton
                  isReject
                  disabled={actionInProgress}
                  onClick={() => executeBatch(EActionTypes.REJECT)}
                >
                  <Icon name="CloseIcon" size="24px" />
                  Reject
                </StyledActionButton>
              ))}
            {type === EInstructionTypes.AFFIRMED && (
              <StyledActionButton
                isReject
                disabled={actionInProgress}
                onClick={() => executeBatch(EActionTypes.WITHDRAW)}
              >
                <Icon name="Check" size="24px" />
                Unapprove
              </StyledActionButton>
            )}
            {type === EInstructionTypes.PENDING && (
              <StyledActionButton
                disabled={actionInProgress}
                onClick={() => executeBatch(EActionTypes.AFFIRM)}
              >
                <Icon name="Check" size="24px" />
                Approve
              </StyledActionButton>
            )}
            {type === EInstructionTypes.FAILED && (
              <StyledActionButton
                disabled={actionInProgress}
                onClick={() => executeBatch(EActionTypes.RESCHEDULE)}
              >
                <Icon name="Check" size="24px" />
                Reschedule
              </StyledActionButton>
            )}
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
          {currentTabInstructions && currentTabInstructions.length ? (
            currentTabInstructions.map((instruction) => (
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
