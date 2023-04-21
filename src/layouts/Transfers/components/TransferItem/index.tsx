import { useEffect, useState } from 'react';
import {
  Instruction,
  InstructionDetails,
  Leg,
  NoArgsProcedureMethod,
} from '@polymeshassociation/polymesh-sdk/types';
import { useSearchParams } from 'react-router-dom';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
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

const calculateCounterparties = (legs: Leg[]) => {
  const involvedIdentities = legs
    .map(({ from, to }) => [from.toHuman().did, to.toHuman().did])
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
    action: NoArgsProcedureMethod<Instruction, Instruction>,
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
  const [instructionDetails, setInstructionDetails] =
    useState<InstructionDetails | null>(null);
  const [instructionLegs, setInstructionLegs] = useState<Leg[]>([]);
  const [legsCount, setLegsCount] = useState<number>(0);
  const [searchParams] = useSearchParams();
  const type = searchParams.get('type');
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  useEffect(() => {
    if (!instruction) return;

    (async () => {
      const { data, count } = await instruction.getLegs();
      const details = await instruction.details();
      setInstructionDetails(details);
      setInstructionLegs(data);

      if (count) {
        setLegsCount(count.toNumber());
      } else {
        setLegsCount(data.length);
      }
    })();
  }, [instruction]);

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  const affirmedOrPending =
    type === EInstructionTypes.AFFIRMED || type === EInstructionTypes.PENDING;

  return (
    <StyledItemWrapper>
      <StyledInfoWrapper>
        {!!instructionDetails && (
          <StyledSelect isSelected={isSelected} onClick={onSelect}>
            <Icon name="Check" size="16px" />
          </StyledSelect>
        )}
        <Details
          data={instructionDetails}
          instructionId={instruction.id.toString()}
          legs={legsCount}
          counterparties={calculateCounterparties(instructionLegs)}
        />
      </StyledInfoWrapper>
      {detailsExpanded && (
        <StyledLegsWrapper>
          {instructionLegs.map((leg, idx) => (
            <InstructionLeg key={`${instruction.toHuman() + idx}`} data={leg} />
          ))}
          {instructionDetails?.memo ? (
            <StyledMemo>
              Memo: <span>{instructionDetails.memo}</span>
            </StyledMemo>
          ) : null}
        </StyledLegsWrapper>
      )}
      <StyledButtonsWrapper expanded={detailsExpanded}>
        {affirmedOrPending && (
          <Button
            disabled={actionInProgress}
            onClick={() => executeAction(instruction.reject)}
          >
            <Icon name="CloseIcon" size="24px" />
            Reject
          </Button>
        )}
        {type === EInstructionTypes.AFFIRMED && (
          <Button
            disabled={actionInProgress}
            onClick={() => executeAction(instruction.withdraw)}
          >
            <Icon name="Check" size="24px" />
            Unapprove
          </Button>
        )}
        {type === EInstructionTypes.PENDING && (
          <Button
            variant="success"
            disabled={actionInProgress}
            onClick={() => executeAction(instruction.affirm)}
          >
            <Icon name="Check" size="24px" />
            Approve
          </Button>
        )}
        {type === EInstructionTypes.FAILED && (
          <Button
            variant="success"
            disabled={actionInProgress}
            onClick={() => executeAction(instruction.reschedule)}
          >
            <Icon name="Check" size="24px" />
            Reschedule
          </Button>
        )}
        <Button variant="secondary" onClick={toggleDetails}>
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledItemWrapper>
  );
};
