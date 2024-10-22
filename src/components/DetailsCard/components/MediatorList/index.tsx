import Tooltip from '~/components/UiKit/Tooltip';
import { CopyToClipboard } from '~/components';
import {
  StyledInfoBlockItem,
  StyledInfoBlockDescription,
  StyledTooltipWrapper,
  StyledBlockHeaderCapitalized,
  StyledTooltipsContainer,
  StyledInfoBlockText,
} from '../../styles';
import { formatDid } from '~/helpers/formatters';

interface IPropertiesItemProps {
  mediatorList: string[];
}

export const MediatorList: React.FC<IPropertiesItemProps> = ({
  mediatorList,
}) => {
  const description =
    'List of identities required to approve instructions for the selected asset.';

  return (
    <StyledInfoBlockItem>
      <StyledTooltipWrapper>
        <StyledBlockHeaderCapitalized>
          Asset Required Mediators
        </StyledBlockHeaderCapitalized>
        <StyledTooltipsContainer>
          <Tooltip caption={description} position="top-right" />
        </StyledTooltipsContainer>
      </StyledTooltipWrapper>
      {mediatorList.map((mediator) => (
        <StyledInfoBlockDescription key={mediator}>
          <StyledInfoBlockText $isPink={false}>
            {formatDid(mediator, 8, 8)}
          </StyledInfoBlockText>
          <CopyToClipboard value={mediator} />
        </StyledInfoBlockDescription>
      ))}
    </StyledInfoBlockItem>
  );
};
