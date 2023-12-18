import { CopyToClipboard } from '~/components';
import { StyledDetailsContainer, StyledId, StyledInfo } from '../../styles';

interface ICardContainerProps {
  label: string;
  value: string;
  children: React.ReactNode;
}

export const CardContainer: React.FC<ICardContainerProps> = ({
  label,
  value,
  children,
}) => {
  return (
    <StyledDetailsContainer>
      <StyledId>
        {label}: #{value}
        <CopyToClipboard value={value} />
      </StyledId>
      <StyledInfo>{children}</StyledInfo>
    </StyledDetailsContainer>
  );
};
