import { CopyToClipboard } from '~/components';
import { StyledDetailsContainer, StyledId, StyledInfo } from '../../styles';

interface ICardContainerProps {
  label: string;
  value: string;
  copyValue?: boolean;
  children: React.ReactNode;
}

export const CardContainer: React.FC<ICardContainerProps> = ({
  label,
  value,
  copyValue,
  children,
}) => {
  return (
    <StyledDetailsContainer>
      <StyledId>
        {label}: {Number.isNaN(Number(value)) ? value : `#${value}`}
        {copyValue && <CopyToClipboard value={value} />}
      </StyledId>
      <StyledInfo>{children}</StyledInfo>
    </StyledDetailsContainer>
  );
};
