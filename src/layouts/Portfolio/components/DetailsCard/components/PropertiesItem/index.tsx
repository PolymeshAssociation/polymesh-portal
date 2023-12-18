import Tooltip from '~/components/UiKit/Tooltip';
import { Icon, CopyToClipboard } from '~/components';
import {
  StyledInfoBlockItem,
  StyledInfoBlockDescription,
  StyledTooltipWrapper,
  StyledBlockHeaderCapitalized,
  StyledTooltipsContainer,
  StyledInfoBlockText,
} from '../../styles';

interface IPropertiesItemProps {
  propKey: string;
  propValue: string;
  propCopy?: string;
  propDescription?: string;
  propIsLocked?: string;
  propExpiry?: Date | null | undefined;
  propUrl?: string;
  isPink?: boolean;
}

export const PropertiesItem: React.FC<IPropertiesItemProps> = ({
  propKey,
  propValue,
  propCopy,
  propDescription,
  propIsLocked,
  propExpiry,
  propUrl,
  isPink = false,
}) => {
  const renderValue = () =>
    propUrl ? (
      <a href={propUrl} target="_blank" rel="noopener noreferrer">
        {propValue}
      </a>
    ) : (
      propValue
    );

  return (
    <StyledInfoBlockItem>
      <StyledTooltipWrapper>
        <StyledBlockHeaderCapitalized>{propKey}</StyledBlockHeaderCapitalized>
        <StyledTooltipsContainer>
          {propDescription && (
            <Tooltip caption={propDescription} position="top-right" />
          )}
          {propIsLocked && (
            <Tooltip
              position="top-right"
              caption={`${propIsLocked} | ${
                propExpiry ? propExpiry : 'Forever'
              }`}
            >
              <Icon name="LockIcon" size="14px" />
            </Tooltip>
          )}
        </StyledTooltipsContainer>
      </StyledTooltipWrapper>
      <StyledInfoBlockDescription>
        <StyledInfoBlockText $isPink={isPink}>
          {renderValue() || '-'}
        </StyledInfoBlockText>
        {propCopy && <CopyToClipboard value={propCopy} />}
      </StyledInfoBlockDescription>
    </StyledInfoBlockItem>
  );
};
