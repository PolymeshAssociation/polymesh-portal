import { FC, useState } from 'react';
import { Icon } from '~/components';
import { Button } from '~/components/UiKit';
import { useMultiSigContext } from '~/context/MultiSigContext';
import { IMultiSigListItem, EProposalAction } from '../../../../types';
import { StyledCard, StyledButtonsWrapper } from './styles';
import { ListItemDetails } from '../ListItemDetails';

interface IMultiSigListItemProps {
  item: IMultiSigListItem;
  executeAction: (action: EProposalAction, proposalId: number) => void;
  actionInProgress: boolean;
}

export const MultiSigListItem: FC<IMultiSigListItemProps> = ({
  item,
  executeAction,
  actionInProgress,
}) => {
  const [detailsExpanded, setDetailsExpanded] = useState(false);

  const { unsignedProposals } = useMultiSigContext();

  const toggleDetails = () => setDetailsExpanded((prev) => !prev);

  const canExecuteAction = unsignedProposals.includes(item.proposalId);

  return (
    <StyledCard>
      <ListItemDetails item={item} detailsExpanded={detailsExpanded} />
      <StyledButtonsWrapper $expanded={detailsExpanded}>
        <Button
          disabled={actionInProgress || !canExecuteAction}
          onClick={() =>
            canExecuteAction &&
            executeAction(EProposalAction.REJECT, item.proposalId)
          }
        >
          <Icon name="CloseIcon" size="24px" />
          Reject
        </Button>
        <Button
          variant="success"
          disabled={actionInProgress || !canExecuteAction}
          onClick={() =>
            canExecuteAction &&
            executeAction(EProposalAction.APPROVE, item.proposalId)
          }
        >
          <Icon name="Check" size="24px" />
          Approve
        </Button>
        <Button variant="secondary" onClick={toggleDetails}>
          <Icon name="ExpandIcon" size="24px" className="expand-icon" />
          Details
        </Button>
      </StyledButtonsWrapper>
    </StyledCard>
  );
};
