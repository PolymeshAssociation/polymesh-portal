import { useContext, useEffect, useRef, useState } from 'react';
import {
  Instruction,
  UnsubCallback,
  GroupedInstructions,
} from '@polymeshassociation/polymesh-sdk/types';
import { useSearchParams } from 'react-router-dom';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
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
import { getLegErrors } from '../TransferItem/helpers';
import { notifyError } from '~/helpers/notifications';
import {
  EInstructionTypes,
  EActionTypes,
  ESortOptions,
  InstructionAction,
} from '../../types';
import { createTransactionChunks, createTransactions } from './helpers';
import { useWindowWidth } from '~/hooks/utility';
import { SkeletonLoader } from '~/components/UiKit';

interface ITransfersListProps {
  sortBy: ESortOptions;
}

export const TransfersList: React.FC<ITransfersListProps> = ({ sortBy }) => {
  const [selectedItems, setSelectedItems] = useState<Instruction[]>([]);
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { account, isExternalConnection } = useContext(AccountContext);
  const { allInstructions, instructionsLoading, refreshInstructions } =
    useContext(InstructionsContext);
  const { handleStatusChange } = useTransactionStatus();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const typeRef = useRef<string | null>(null);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [invalidInstructions, setInvalidInstructions] = useState<number[]>([]);
  const { isWidescreen, isMobile } = useWindowWidth();

  const currentTabInstructions =
    !allInstructions || !type
      ? null
      : allInstructions[type as keyof GroupedInstructions];

  useEffect(() => {
    if (!selectedItems.length || typeRef.current === type) return;

    setSelectedItems([]);
  }, [type, selectedItems]);

  useEffect(() => {
    if (
      (type !== 'pending' && typeRef.current !== 'pending') ||
      !currentTabInstructions ||
      !sdk
    ) {
      return;
    }
    (async () => {
      const instructionsWithErrors = await Promise.all(
        currentTabInstructions?.map(async (instruction) => {
          const { data } = await instruction.getLegs();
          const { data: affirmations } = await instruction.getAffirmations();
          const details = await instruction.details();
          const block = await sdk.network.getLatestBlock();
          const uniqueAffirmations = affirmations.filter(
            (a, index, self) =>
              index ===
              self.findIndex((t) => t.identity.did === a.identity.did),
          );
          const legErrors = await Promise.all(
            data.map(async (leg) => ({
              leg,
              errors: await getLegErrors({
                leg,
                affirmationsData: uniqueAffirmations,
                instructionDetails: details,
                latestBlock: block.toNumber(),
              }),
            })),
          );
          if (legErrors.some((leg) => leg.errors.length)) {
            return instruction.id.toNumber();
          } else {
            return null;
          }
        }),
      );
      const filteredInstructions = instructionsWithErrors.filter(
        (instruction) => instruction,
      );

      setInvalidInstructions(filteredInstructions as number[]);
    })();
  }, [type, sdk, currentTabInstructions]);

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

  const executeBatch = async (
    action: `${EActionTypes}`,
    items?: Instruction[],
  ) => {
    if (!sdk || !account) return;

    let unsubCb: UnsubCallback | undefined;

    try {
      setActionInProgress(true);

      const itemsToExecute = items || selectedItems;
      const transactions = await createTransactions(action, itemsToExecute);

      if (!transactions) return;

      const chunks = createTransactionChunks(transactions, 10);

      const currentNonce = await account.getCurrentNonce();
      await Promise.all(
        chunks.map(async (chunk, index) => {
          const batch = await sdk.createTransactionBatch(
            {
              transactions: chunk,
            },
            { nonce: () => new BigNumber(currentNonce.toNumber() + index) },
          );
          unsubCb = await batch.onStatusChange((transaction) =>
            handleStatusChange(transaction, index),
          );
          await batch.run();
        }),
      );
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

  const executeAction = async (action: InstructionAction) => {
    if (!sdk) return;

    let unsubCb: UnsubCallback | undefined;
    try {
      setActionInProgress(true);
      let tx;
      if (Array.isArray(action)) {
        const transactions = await Promise.all(
          action.map(async (method) => method()),
        );
        tx = await sdk.createTransactionBatch({
          transactions,
        });
      } else {
        tx = await action();
      }

      unsubCb = await tx.onStatusChange((transaction) =>
        handleStatusChange(transaction),
      );
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

  const handleApproveValidBatch = () => {
    const validInctructionsSelected = currentTabInstructions?.filter(
      (instruction) => !invalidInstructions.includes(instruction.id.toNumber()),
    );

    setSelectedItems(validInctructionsSelected as Instruction[]);
    executeBatch(EActionTypes.AFFIRM, validInctructionsSelected);
  };

  const sortInstructions = (instructions: Instruction[]) => {
    switch (sortBy) {
      case ESortOptions.NEWEST:
        return instructions.sort((a, b) => b.id.toNumber() - a.id.toNumber());

      case ESortOptions.OLDEST:
        return instructions.sort((a, b) => a.id.toNumber() - b.id.toNumber());

      default:
        return instructions;
    }
  };

  return (
    <>
      <StyledSelectionWrapper>
        <SelectAllButton
          onClick={handleSelectAll}
          disabled={isExternalConnection || instructionsLoading}
        >
          Select All
        </SelectAllButton>
        {!!selectedItems.length && (
          <StyledButtonWrapper>
            <StyledActionButton
              $isReject
              disabled={actionInProgress || isExternalConnection}
              onClick={() => executeBatch(EActionTypes.REJECT)}
            >
              <Icon name="CloseIcon" size="24px" />
              {!isMobile && 'Reject'}
            </StyledActionButton>
            {type === EInstructionTypes.AFFIRMED && (
              <StyledActionButton
                $isReject
                disabled={actionInProgress || isExternalConnection}
                onClick={() => executeBatch(EActionTypes.WITHDRAW)}
              >
                <Icon name="Check" size="24px" />
                {!isMobile && 'Unapprove'}
              </StyledActionButton>
            )}
            {type === EInstructionTypes.PENDING && (
              <StyledActionButton
                disabled={actionInProgress || isExternalConnection}
                onClick={handleApproveValidBatch}
              >
                <Icon name="Check" size="24px" />
                {!isMobile && 'Approve Valid'}
              </StyledActionButton>
            )}
            {/* {type === EInstructionTypes.FAILED && (
              <StyledActionButton
                disabled={actionInProgress}
                onClick={() => executeBatch(EActionTypes.EXECUTE)}
              >
                <Icon name="Check" size="24px" />
                EXECUTE
              </StyledActionButton>
            )} */}
          </StyledButtonWrapper>
        )}
        <StyledSelected>
          {isWidescreen && 'Selected:'}
          <span>{selectedItems.length}</span>
          {!!selectedItems.length && (
            <ClearSelectionButton onClick={clearSelection}>
              <Icon name="CloseIcon" size="16px" />
            </ClearSelectionButton>
          )}
        </StyledSelected>
      </StyledSelectionWrapper>

      {instructionsLoading ? (
        <SkeletonLoader height={isMobile ? 344 : 162} />
      ) : (
        <StyledTransfersList>
          {currentTabInstructions && currentTabInstructions.length ? (
            sortInstructions(currentTabInstructions).map((instruction) => (
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
