import { useContext, useEffect, useRef, useState } from 'react';
import {
  NoArgsProcedureMethod,
  DistributionWithDetails,
  DividendDistribution,
} from '@polymeshassociation/polymesh-sdk/types';
import { useSearchParams } from 'react-router-dom';
import { DistributionsContext } from '~/context/DistributionsContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { AccountContext } from '~/context/AccountContext';
import { useTransactionStatusContext } from '~/context/TransactionStatusContext';
import { Icon } from '~/components';
import {
  StyledSelectionWrapper,
  SelectAllButton,
  StyledSelected,
  StyledDistributionsList,
  StyledButtonWrapper,
  StyledActionButton,
  ClearSelectionButton,
  DistributionsPlaceholder,
} from './styles';
import { DistributionItem } from '../DistributionItem';
import { ESortOptions } from '../../types';
import { SkeletonLoader } from '~/components/UiKit';
import { useWindowWidth } from '~/hooks/utility';

interface IDistributionsListProps {
  sortBy: ESortOptions;
}

export const DistributionsList: React.FC<IDistributionsListProps> = ({
  sortBy,
}) => {
  const [selectedItems, setSelectedItems] = useState<DividendDistribution[]>(
    [],
  );
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { isExternalConnection } = useContext(AccountContext);
  const { pendingDistributions, distributionsLoading, refreshDistributions } =
    useContext(DistributionsContext);
  const {
    executeTransaction,
    executeBatchTransaction,
    isTransactionInProgress,
  } = useTransactionStatusContext();
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const typeRef = useRef<string | null>(null);
  const { isMobile, isTablet } = useWindowWidth();

  const isSmallScreen = isMobile || isTablet;

  useEffect(() => {
    if (!selectedItems.length || typeRef.current === type) return;

    setSelectedItems([]);
  }, [type, selectedItems]);

  const handleItemSelect = (selectedDistribution: DividendDistribution) => {
    typeRef.current = type;
    setSelectedItems((prev) => {
      if (!prev.length) {
        return [selectedDistribution];
      }
      if (
        prev.some(
          (distribution) =>
            distribution.id.toString() === selectedDistribution.id.toString(),
        )
      ) {
        return prev.filter(
          (distribution) =>
            distribution.id.toString() !== selectedDistribution.id.toString(),
        );
      }
      return [...prev, selectedDistribution];
    });
  };

  const handleSelectAll = () => {
    if (!pendingDistributions) return;
    typeRef.current = type;
    setSelectedItems(
      pendingDistributions.map(({ distribution }) => distribution),
    );
  };

  const clearSelection = () => {
    setSelectedItems([]);
  };

  const executeAction = async (
    action:
      | NoArgsProcedureMethod<void, void>
      | NoArgsProcedureMethod<void, void>[],
  ) => {
    if (!sdk) return;

    try {
      if (Array.isArray(action)) {
        const transactionPromises = action.map(async (method) => method());
        await executeBatchTransaction(transactionPromises, {
          onSuccess: () => {
            refreshDistributions();
          },
        });
      } else {
        await executeTransaction(action(), {
          onSuccess: () => {
            refreshDistributions();
          },
        });
      }
    } catch (error) {
      // Error is already handled by the transaction context and notified to the user
      // This catch block prevents unhandled promise rejection
    }
  };

  const sortDistributions = (distributions: DistributionWithDetails[]) => {
    switch (sortBy) {
      case ESortOptions.NEWEST:
        return distributions.sort(
          (a, b) => b.distribution.id.toNumber() - a.distribution.id.toNumber(),
        );

      case ESortOptions.OLDEST:
        return distributions.sort(
          (a, b) => a.distribution.id.toNumber() - b.distribution.id.toNumber(),
        );

      default:
        return distributions;
    }
  };

  return (
    <>
      <StyledSelectionWrapper>
        <SelectAllButton
          onClick={handleSelectAll}
          disabled={
            distributionsLoading ||
            !pendingDistributions.length ||
            isExternalConnection
          }
        >
          Select All
        </SelectAllButton>
        {!!selectedItems.length && (
          <StyledButtonWrapper>
            <StyledActionButton
              disabled={isTransactionInProgress || isExternalConnection}
              onClick={() =>
                executeAction(selectedItems.map(({ claim }) => claim))
              }
            >
              <Icon name="Check" size="24px" />
              Claim
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

      {distributionsLoading ? (
        <SkeletonLoader height={isSmallScreen ? 300 : 162} />
      ) : (
        <StyledDistributionsList>
          {pendingDistributions.length ? (
            sortDistributions(pendingDistributions).map(({ distribution }) => (
              <DistributionItem
                key={distribution.id.toString()}
                distribution={distribution}
                onSelect={() => handleItemSelect(distribution)}
                isSelected={selectedItems.some(
                  ({ id }) => id.toString() === distribution.id.toString(),
                )}
                executeAction={executeAction}
                actionInProgress={isTransactionInProgress}
              />
            ))
          ) : (
            <DistributionsPlaceholder>
              No data available
            </DistributionsPlaceholder>
          )}
        </StyledDistributionsList>
      )}
    </>
  );
};
