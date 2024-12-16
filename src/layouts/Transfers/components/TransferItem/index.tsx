import { useContext, useState } from 'react';
import {
  Instruction,
  InstructionType,
} from '@polymeshassociation/polymesh-sdk/types';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import { Button, SkeletonLoader } from '~/components/UiKit';
import {
  StyledItemWrapper,
  StyledInfoWrapper,
  StyledButtonsWrapper,
  StyledSelect,
  StyledLegsWrapper,
  StyledMemo,
  StyledExpandIcon, // add this import
  StyledToggleButtonsContainer, // add this import
} from './styles';
import { Details } from './components/Details';
import { InstructionLeg } from './components/InstructionLeg';
import { Mediators } from './components/Mediators';
import {
  EInstructionTypes,
  InstructionAction,
  InstructionData,
} from '../../types';
import { getAffirmationStatus, isLastManualAffirmation } from './helpers';
import { AccountContext } from '~/context/AccountContext';

interface IAuthorizationItemProps {
  instruction: Instruction;
  onSelect: () => void;
  isSelected: boolean;
  executeAction: (action: InstructionAction | InstructionAction[]) => void;
  actionInProgress: boolean;
  details?: InstructionData;
}

export const TransferItem: React.FC<IAuthorizationItemProps> = ({
  instruction,
  onSelect,
  isSelected,
  executeAction,
  actionInProgress,
  details,
}) => {
  const { identity, isExternalConnection } = useContext(AccountContext);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [mediatorsExpanded, setMediatorsExpanded] = useState(false);

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  const instructionLegs = details ? details.legs : [];
  const instructionDetails = details ? details.details : null;
  const instructionAffirmations = details ? details.affirmations : [];
  const affirmationsCount = details ? details.affirmationsCount : 0;
  const counterparties = details ? details.counterparties : 0;
  const latestBlock = details ? details.latestBlock : 0;
  const legsCount = instructionLegs.length;

  const isSettleManual =
    instructionDetails?.type === InstructionType.SettleManual;
  const isFullyAffirmed = affirmationsCount === counterparties;

  const isAllowedToSettleManually =
    isSettleManual &&
    latestBlock > instructionDetails.endAfterBlock.toNumber() &&
    isFullyAffirmed;

  const isManualCannotAffirm =
    isSettleManual &&
    instructionLegs.some(({ errors }) => {
      if (errors.length === 1 && errors[0].startsWith('Block errors:')) {
        return false;
      }
      return !!errors.length;
    });

  const canAffirmAndExecute =
    isSettleManual &&
    isLastManualAffirmation({
      instructionAffirmations,
      counterparties,
      identity,
    });
  const legsHaveErrors = instructionLegs.some(({ errors }) => !!errors.length);

  const affirmationStatus =
    identity && getAffirmationStatus(instructionAffirmations, identity.did);

  const isFailedCanBeAffirmed =
    type === EInstructionTypes.FAILED &&
    (isSettleManual ||
      instructionDetails?.type === InstructionType.SettleOnAffirmation) &&
    affirmationStatus &&
    affirmationStatus !== 'Affirmed';

  const isFailedCanWithdrawAffirmation =
    type === EInstructionTypes.FAILED &&
    (isSettleManual ||
      instructionDetails?.type === InstructionType.SettleOnAffirmation) &&
    affirmationStatus === 'Affirmed';

  return (
    <StyledItemWrapper>
      <StyledInfoWrapper>
        {!details ? (
          <SkeletonLoader
            circle
            width={20}
            height={20}
            containerClassName="select-placeholder"
          />
        ) : (
          <StyledSelect $isSelected={isSelected} onClick={onSelect}>
            <Icon name="Check" size="16px" />
          </StyledSelect>
        )}

        <Details
          data={instructionDetails}
          affirmationsCount={affirmationsCount}
          instructionId={instruction.id.toString()}
          counterparties={counterparties}
        />
      </StyledInfoWrapper>
      {detailsExpanded && (
        <StyledLegsWrapper>
          {instructionLegs.map((data, idx) => (
            <InstructionLeg
              key={`${instruction.id.toString() + idx}`}
              data={data}
              affirmationsData={instructionAffirmations}
            />
          ))}
          {instructionDetails?.memo ? (
            <StyledMemo>
              Memo: <span>{instructionDetails.memo}</span>
            </StyledMemo>
          ) : null}
        </StyledLegsWrapper>
      )}
      {mediatorsExpanded && details && (
        <Mediators mediators={details.mediators} />
      )}
      <StyledButtonsWrapper $expanded={detailsExpanded}>
        <Button
          disabled={!details || actionInProgress || isExternalConnection}
          onClick={() => executeAction({ method: instruction.reject })}
        >
          <Icon name="CloseIcon" size="24px" />
          Reject
        </Button>
        {(type === EInstructionTypes.AFFIRMED ||
          isFailedCanWithdrawAffirmation) && (
          <>
            <Button
              disabled={!details || actionInProgress || isExternalConnection}
              onClick={() => executeAction({ method: instruction.withdraw })}
            >
              <Icon name="Check" size="24px" />
              Unapprove
            </Button>
            {isAllowedToSettleManually && type !== EInstructionTypes.FAILED && (
              <Button
                variant="success"
                disabled={
                  actionInProgress || legsHaveErrors || isExternalConnection
                }
                onClick={() =>
                  executeAction({ method: instruction.executeManually })
                }
              >
                <Icon name="Check" size="24px" />
                Settle
              </Button>
            )}
          </>
        )}
        {(type === EInstructionTypes.PENDING || isFailedCanBeAffirmed) && (
          <>
            <Button
              variant="success"
              disabled={
                isExternalConnection ||
                !details ||
                actionInProgress ||
                (!isSettleManual && legsHaveErrors) ||
                isManualCannotAffirm
              }
              onClick={() => executeAction({ method: instruction.affirm })}
            >
              <Icon name="Check" size="24px" />
              Approve
            </Button>
            {canAffirmAndExecute && (
              <Button
                variant="success"
                disabled={
                  !details ||
                  actionInProgress ||
                  legsHaveErrors ||
                  isExternalConnection
                }
                onClick={() =>
                  executeAction([
                    { method: instruction.affirm },
                    {
                      method: instruction.executeManually,
                      params: { skipAffirmationCheck: true },
                    },
                  ])
                }
              >
                <Icon name="Check" size="24px" />
                Approve and Settle
              </Button>
            )}
          </>
        )}
        {type === EInstructionTypes.FAILED && (
          <Button
            variant="success"
            disabled={
              isExternalConnection ||
              !details ||
              actionInProgress ||
              legsHaveErrors ||
              !isFullyAffirmed
            }
            onClick={() =>
              executeAction({ method: instruction.executeManually })
            }
          >
            <Icon name="Check" size="24px" />
            Retry Settling
          </Button>
        )}
        <StyledToggleButtonsContainer>
          <Button
            variant="secondary"
            className="toggle-button"
            onClick={toggleDetails}
            disabled={!details}
          >
            <StyledExpandIcon
              name="ExpandIcon"
              size="24px"
              $expanded={detailsExpanded}
            />
            Details
            {legsCount > 0 && (
              <>
                :{' '}
                <span className="leg-count">
                  {legsCount} Leg
                  {legsCount > 1 ? 's' : ''}
                </span>
              </>
            )}
          </Button>
          {details && details.mediators.length > 0 && (
            <Button
              variant="secondary"
              className="toggle-button"
              onClick={() => setMediatorsExpanded((prev) => !prev)}
              disabled={!details}
            >
              <StyledExpandIcon
                name="ExpandIcon"
                size="24px"
                $expanded={mediatorsExpanded}
              />
              Mediators
            </Button>
          )}
        </StyledToggleButtonsContainer>
      </StyledButtonsWrapper>
    </StyledItemWrapper>
  );
};
