import { useEffect, useState } from 'react';
import {
  Instruction,
  InstructionDetails,
  Leg,
  NoArgsProcedureMethod,
} from '@polymeshassociation/polymesh-sdk/types';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import {
  StyledItemWrapper,
  StyledInfoWrapper,
  StyledButtonsWrapper,
  StyledSelect,
  StyledLegsWrapper,
} from './styles';
import { Details } from './components/Details';
import { InstructionLeg } from './components/InstructionLeg';

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
      }
    })();
  }, [instruction]);

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  return (
    <StyledItemWrapper>
      <StyledInfoWrapper>
        <StyledSelect isSelected={isSelected} onClick={onSelect}>
          <Icon name="Check" size="16px" />
        </StyledSelect>
        <Details
          data={instructionDetails}
          legs={legsCount}
          counterparties={legsCount}
        />
      </StyledInfoWrapper>
      {detailsExpanded && (
        <StyledLegsWrapper>
          {instructionLegs.map((leg, idx) => (
            <InstructionLeg key={`${instruction.toHuman() + idx}`} data={leg} />
          ))}
        </StyledLegsWrapper>
      )}
      <StyledButtonsWrapper expanded={detailsExpanded}>
        <Button
          disabled={actionInProgress}
          onClick={() => executeAction(instruction.reject)}
        >
          <Icon name="CloseIcon" size="24px" />
          Reject
        </Button>
        <Button
          variant="success"
          disabled={actionInProgress}
          onClick={() => executeAction(instruction.affirm)}
        >
          <Icon name="Check" size="24px" />
          Approve
        </Button>
        <Button variant="secondary" onClick={toggleDetails}>
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledItemWrapper>
  );
};
