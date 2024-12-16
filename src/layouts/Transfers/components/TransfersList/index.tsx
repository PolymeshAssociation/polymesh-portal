import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  Instruction,
  UnsubCallback,
  GroupedInstructions,
  AffirmationStatus,
} from '@polymeshassociation/polymesh-sdk/types';
import { useSearchParams } from 'react-router-dom';
import { BigNumber } from '@polymeshassociation/polymesh-sdk';
import { InstructionsContext } from '~/context/InstructionsContext';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { useTransactionStatus } from '~/hooks/polymesh';
import { Icon, Pagination } from '~/components';
import {
  StyledSelectionWrapper,
  SelectAllButton,
  StyledSelected,
  StyledTransfersList,
  StyledButtonWrapper,
  StyledActionButton,
  ClearSelectionButton,
  TransfersPlaceholder,
  StyledPaginationContainer,
  StyledPerPageWrapper,
  StyledPerPageSelect,
} from './styles';
import { TransferItem } from '../TransferItem';
import { getLegErrors } from '../TransferItem/helpers';
import { notifyError } from '~/helpers/notifications';
import {
  EInstructionTypes,
  EActionTypes,
  ESortOptions,
  InstructionAction,
  InstructionData,
} from '../../types';
import { createTransactionChunks, createTransactions } from './helpers';
import { useWindowWidth } from '~/hooks/utility';
import { SkeletonLoader, Button } from '~/components/UiKit';
import { useTransfersPagination } from './hooks';
import { calculateCounterparties } from '../../helpers';

interface ITransfersListProps {
  sortBy: ESortOptions;
}

interface CachedDetails {
  [key: string]: Record<string, InstructionData>;
}

const perPageOptions = [3, 5, 10, 20, 50];

export const TransfersList: React.FC<ITransfersListProps> = ({ sortBy }) => {
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');

  const typeRef = useRef<string | null>(null);
  const cachedDetailsRef = useRef<CachedDetails>({});

  const [selectedItems, setSelectedItems] = useState<Instruction[]>([]);
  const [actionInProgress, setActionInProgress] = useState(false);
  const [invalidInstructions, setInvalidInstructions] = useState<number[]>([]);
  const [instructionDetails, setInstructionDetails] = useState<
    Record<string, InstructionData>
  >({});

  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { account, isExternalConnection } = useContext(AccountContext);
  const { allInstructions, instructionsLoading, refreshInstructions } =
    useContext(InstructionsContext);
  const { handleStatusChange } = useTransactionStatus();
  const { isWidescreen, isMobile, isTablet } = useWindowWidth();

  const currentTabInstructions = useMemo(
    () =>
      !allInstructions || !type
        ? null
        : allInstructions[type as keyof GroupedInstructions],
    [allInstructions, type],
  );

  const {
    currentItems,
    totalItems,
    isPrevDisabled,
    isNextDisabled,
    pageSize,
    setPageSize,
    onFirstPageClick,
    onPrevPageClick,
    onNextPageClick,
    onLastPageClick,
  } = useTransfersPagination(currentTabInstructions?.length || 0, type);

  useEffect(() => {
    setSelectedItems([]);
    typeRef.current = type;
  }, [type, currentItems]);

  const isSmallScreen = isMobile || isTablet;

  useEffect(() => {
    if (!currentTabInstructions || !sdk) {
      return;
    }
    // Set initial details from cache if available
    setInstructionDetails(cachedDetailsRef.current[type as string] || {});

    (async () => {
      const detailsMap: Record<string, InstructionData> = {};
      const block = await sdk.network.getLatestBlock();
      const instructionsWithErrors = await Promise.all(
        currentTabInstructions
          .slice(currentItems.first - 1, currentItems.last)
          .map(async (instruction) => {
            try {
              const [legsResultSet, affirmations, details, mediators] =
                await Promise.all([
                  instruction.getLegs(),
                  instruction.getAffirmations(),
                  instruction.details(),
                  instruction.getMediators(),
                ]);

              const affirmedMediator = mediators.filter(
                (mediator) => mediator.status === AffirmationStatus.Affirmed,
              );

              const counterpartyAffirmations = affirmedMediator.reduce(
                (acc, mediator) => {
                  const mediatorAffirmationIndex = acc.findIndex(
                    (affirmation) =>
                      affirmation.identity.did === mediator.identity.did,
                  );

                  if (mediatorAffirmationIndex === -1) {
                    throw new Error(
                      `No matching affirmation found for mediator with DID: ${mediator.identity.did}`,
                    );
                  }

                  return [
                    ...acc.slice(0, mediatorAffirmationIndex),
                    ...acc.slice(mediatorAffirmationIndex + 1),
                  ];
                },
                affirmations.data,
              );

              const legErrors = await Promise.all(
                legsResultSet.data.map(async (leg) => ({
                  leg,
                  errors: await getLegErrors({
                    leg,
                    affirmationsData: counterpartyAffirmations,
                    instructionDetails: details,
                    latestBlock: block.toNumber(),
                  }),
                })),
              );

              detailsMap[instruction.id.toString()] = {
                legs: legErrors,
                details,
                affirmations: counterpartyAffirmations,
                affirmationsCount: counterpartyAffirmations.filter(
                  (a) => a.status === AffirmationStatus.Affirmed,
                ).length,
                counterparties: calculateCounterparties(legErrors),
                latestBlock: block.toNumber(),
                mediators,
              };

              if (legErrors.some((leg) => leg.errors.length)) {
                return instruction.id.toNumber();
              }
              return null;
            } catch (error) {
              notifyError(
                `Error querying details of instruction ID ${instruction.id.toString()}. Error details: ${(error as Error).message}`,
              );
              return null;
            }
          }),
      );
      const filteredInstructions = instructionsWithErrors.filter(
        (instruction) => !!instruction,
      );

      setInvalidInstructions(filteredInstructions as number[]);
      if (type === typeRef.current) {
        setInstructionDetails((prevDetails) => ({
          ...prevDetails,
          ...detailsMap,
        }));
      }

      // Update cache using ref
      cachedDetailsRef.current = {
        ...cachedDetailsRef.current,
        [type as string]: {
          ...(cachedDetailsRef.current[type as string] || {}),
          ...detailsMap,
        },
      };
    })();
  }, [
    type,
    sdk,
    currentTabInstructions,
    currentItems.first,
    currentItems.last,
  ]); // removed cachedDetails from dependencies

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
    if (!allInstructions) return;
    const groupedInstructions = allInstructions[
      type as keyof GroupedInstructions
    ]
      .slice(currentItems.first - 1, currentItems.last)
      .filter((instruction) => instructionDetails[instruction.id.toString()]);
    setSelectedItems(groupedInstructions);
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
  const executeAction = async (
    action: InstructionAction | InstructionAction[],
  ) => {
    if (!sdk) return;

    let unsubCb: UnsubCallback | undefined;
    try {
      setActionInProgress(true);
      let tx;
      if (Array.isArray(action)) {
        const transactions = await Promise.all(
          action.map(async (actionItem) => {
            if (actionItem.params) {
              return actionItem.method(actionItem.params);
            }
            return actionItem.method();
          }),
        );
        tx = await sdk.createTransactionBatch({
          transactions,
        });
      } else if (action.params) {
        tx = await action.method(action.params);
      } else {
        tx = await action.method();
      }

      unsubCb = tx.onStatusChange((transaction) =>
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
    const validInctructionsSelected = currentTabInstructions
      ?.slice(currentItems.first - 1, currentItems.last)
      .filter(
        (instruction) =>
          !invalidInstructions.includes(instruction.id.toNumber()),
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
            <>
              {sortInstructions(currentTabInstructions)
                .slice(currentItems.first - 1, currentItems.last)
                .map((instruction) => (
                  <TransferItem
                    key={instruction.toHuman()}
                    instruction={instruction}
                    onSelect={() => handleItemSelect(instruction)}
                    isSelected={selectedItems.some(
                      (item) => item.toHuman() === instruction.toHuman(),
                    )}
                    executeAction={executeAction}
                    actionInProgress={actionInProgress}
                    details={instructionDetails[instruction.id.toString()]}
                  />
                ))}
              <StyledPaginationContainer>
                {!isSmallScreen && (
                  <StyledPerPageWrapper>
                    Show:
                    <StyledPerPageSelect>
                      <select
                        onChange={({ target }) => {
                          setPageSize(Number(target.value));
                        }}
                        value={pageSize}
                      >
                        {perPageOptions.map((option) => (
                          <option
                            className="options"
                            key={option}
                            value={option}
                          >
                            {option}
                          </option>
                        ))}
                      </select>
                      <Icon name="DropdownIcon" className="dropdown-icon" />
                    </StyledPerPageSelect>
                  </StyledPerPageWrapper>
                )}
                {isSmallScreen ? (
                  <>
                    <Button disabled={isPrevDisabled} onClick={onPrevPageClick}>
                      <Icon name="PrevPage" />
                      Previous
                    </Button>
                    <Button
                      variant="secondary"
                      disabled={isNextDisabled}
                      onClick={onNextPageClick}
                    >
                      Next
                      <Icon name="NextPage" />
                    </Button>
                  </>
                ) : (
                  <Pagination
                    totalItems={totalItems}
                    currentItems={currentItems}
                    isPrevDisabled={isPrevDisabled}
                    isNextDisabled={isNextDisabled}
                    onFirstPageClick={onFirstPageClick}
                    onPrevPageClick={onPrevPageClick}
                    onNextPageClick={onNextPageClick}
                    onLastPageClick={onLastPageClick}
                  />
                )}
              </StyledPaginationContainer>
            </>
          ) : (
            <TransfersPlaceholder>No data available</TransfersPlaceholder>
          )}
        </StyledTransfersList>
      )}
    </>
  );
};
