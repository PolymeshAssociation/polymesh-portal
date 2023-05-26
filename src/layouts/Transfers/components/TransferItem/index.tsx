import { useContext, useEffect, useState } from 'react';
import {
  AffirmationStatus,
  Instruction,
  InstructionAffirmation,
  InstructionDetails,
  InstructionType,
  Leg,
  NoArgsProcedureMethod,
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
} from './styles';
import { Details } from './components/Details';
import { InstructionLeg } from './components/InstructionLeg';
import { EInstructionTypes } from '../../types';
import { getLegErrors, isLastManualAffirmation } from './helpers';
import { AccountContext } from '~/context/AccountContext';
import { PolymeshContext } from '~/context/PolymeshContext';
import { notifyError } from '~/helpers/notifications';

const calculateCounterparties = (legs: { leg: Leg; errors: string[] }[]) => {
  const involvedIdentities = legs
    .map(({ leg: { from, to } }) => [from.toHuman().did, to.toHuman().did])
    .flat();

  return involvedIdentities.filter(
    (value, idx, array) => array.indexOf(value) === idx,
  ).length;
};

interface IAuthorizationItemProps {
  instruction: Instruction;
  onSelect: () => void;
  isSelected: boolean;
  executeAction: (
    action:
      | NoArgsProcedureMethod<Instruction, Instruction>
      | NoArgsProcedureMethod<Instruction, Instruction>[],
  ) => void;
  actionInProgress: boolean;
}

export const TransferItem: React.FC<IAuthorizationItemProps> = ({
  instruction,
  onSelect,
  isSelected,
  executeAction,
  actionInProgress,
}) => {
  const {
    api: { sdk },
  } = useContext(PolymeshContext);
  const { identity } = useContext(AccountContext);
  const [instructionDetails, setInstructionDetails] =
    useState<InstructionDetails | null>(null);
  const [instructionLegs, setInstructionLegs] = useState<
    { leg: Leg; errors: string[] }[]
  >([]);
  const [legsCount, setLegsCount] = useState<number>(0);
  const [instructionAffirmations, setInstructionAffirmations] = useState<
    InstructionAffirmation[]
  >([]);
  const [latestBlock, setLatestBlock] = useState<number>(0);
  const [affirmationsCount, setAffirmationsCount] = useState<number>(0);
  const [detailsLoading, setDetailsLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  useEffect(() => {
    if (!instruction || !sdk) return;

    (async () => {
      setDetailsLoading(true);
      try {
        const { data, count } = await instruction.getLegs();
        const details = await instruction.details();
        const { data: affirmations } = await instruction.getAffirmations();
        const uniqueAffirmations = affirmations.filter(
          (a, index, self) =>
            index === self.findIndex((t) => t.identity.did === a.identity.did),
        );
        const block = await sdk.network.getLatestBlock();
        setLatestBlock(block.toNumber());

        const legsWithErrors = await Promise.all(
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
        setInstructionLegs(legsWithErrors);
        setInstructionAffirmations(uniqueAffirmations);
        setInstructionDetails(details);
        setAffirmationsCount(
          uniqueAffirmations.filter(
            (affirmation) => affirmation.status === AffirmationStatus.Affirmed,
          ).length,
        );

        if (count) {
          setLegsCount(count.toNumber());
        } else {
          setLegsCount(data.length);
        }
      } catch (error) {
        notifyError((error as Error).message);
      } finally {
        setDetailsLoading(false);
      }
    })();
  }, [instruction, sdk]);

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  const isSettleManual =
    instructionDetails?.type === InstructionType.SettleManual;

  const isFullyAffirmed =
    affirmationsCount === calculateCounterparties(instructionLegs);

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
      counterparties: calculateCounterparties(instructionLegs),
      identity,
    });

  const legsHaveErrors = instructionLegs.some(({ errors }) => !!errors.length);

  return (
    <StyledItemWrapper>
      <StyledInfoWrapper>
        {detailsLoading ? (
          <SkeletonLoader
            circle
            width={20}
            height={20}
            containerClassName="select-placeholder"
          />
        ) : (
          <StyledSelect isSelected={isSelected} onClick={onSelect}>
            <Icon name="Check" size="16px" />
          </StyledSelect>
        )}
        <Details
          data={instructionDetails}
          affirmationsCount={affirmationsCount}
          instructionId={instruction.id.toString()}
          counterparties={calculateCounterparties(instructionLegs)}
          loading={detailsLoading}
        />
      </StyledInfoWrapper>
      {detailsExpanded && (
        <StyledLegsWrapper>
          {instructionLegs.map((data, idx) => (
            <InstructionLeg
              key={`${instruction.toHuman() + idx}`}
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
      <StyledButtonsWrapper expanded={detailsExpanded}>
        <Button
          disabled={detailsLoading || actionInProgress}
          onClick={() => executeAction(instruction.reject)}
        >
          <Icon name="CloseIcon" size="24px" />
          Reject
        </Button>
        {type === EInstructionTypes.AFFIRMED && (
          <>
            <Button
              disabled={detailsLoading || actionInProgress}
              onClick={() => executeAction(instruction.withdraw)}
            >
              <Icon name="Check" size="24px" />
              Unapprove
            </Button>
            {isAllowedToSettleManually && (
              <Button
                variant="success"
                disabled={actionInProgress || legsHaveErrors}
                onClick={() => executeAction(instruction.executeManually)}
              >
                <Icon name="Check" size="24px" />
                Settle
              </Button>
            )}
          </>
        )}
        {type === EInstructionTypes.PENDING && (
          <>
            <Button
              variant="success"
              disabled={
                detailsLoading ||
                actionInProgress ||
                (!isSettleManual && legsHaveErrors) ||
                isManualCannotAffirm
              }
              onClick={() => executeAction(instruction.affirm)}
            >
              <Icon name="Check" size="24px" />
              Approve
            </Button>
            {/* {canAffirmAndExecute && (
              <Button
                variant="success"
                disabled={detailsLoading || actionInProgress || legsHaveErrors}
                onClick={() =>
                  executeAction([
                    instruction.affirm,
                    instruction.executeManually,
                  ])
                }
              >
                <Icon name="Check" size="24px" />
                Approve and Settle
              </Button>
            )} */}
          </>
        )}
        {type === EInstructionTypes.FAILED && (
          <Button
            variant="success"
            disabled={
              detailsLoading ||
              actionInProgress ||
              legsHaveErrors ||
              !isFullyAffirmed
            }
            onClick={() => executeAction(instruction.reschedule)}
          >
            <Icon name="Check" size="24px" />
            Retry Settling
          </Button>
        )}
        <Button
          variant="secondary"
          onClick={toggleDetails}
          disabled={detailsLoading}
        >
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
          {!!legsCount && (
            <>
              :{' '}
              <span className="leg-count">
                {legsCount} Leg{legsCount > 1 ? 's' : ''}
              </span>
            </>
          )}
        </Button>
      </StyledButtonsWrapper>
    </StyledItemWrapper>
  );
};
