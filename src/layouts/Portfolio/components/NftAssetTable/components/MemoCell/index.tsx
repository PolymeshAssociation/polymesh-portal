import { StyledMemo } from './styles';

interface IMemoCellProps {
  memo: string | null;
}

export const MemoCell: React.FC<IMemoCellProps> = ({ memo }) => {
  if (!memo) return '-';
  return <StyledMemo title={memo}>{memo}</StyledMemo>;
};
