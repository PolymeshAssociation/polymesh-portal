import { StyledTruncatedText } from './styles';

interface ITruncatedTextCellProps {
  text: string | null | undefined;
  maxWidth: number;
  // Shows the text as written, for user-entered text such as a memo
  keepCase?: boolean;
}

// Keeps a cell to one line so a table with many columns still fits its card;
// the full text shows on hover
export const TruncatedTextCell: React.FC<ITruncatedTextCellProps> = ({
  text,
  maxWidth,
  keepCase,
}) => {
  if (!text) return '-';
  return (
    <StyledTruncatedText $maxWidth={maxWidth} $keepCase={keepCase} title={text}>
      {text}
    </StyledTruncatedText>
  );
};
