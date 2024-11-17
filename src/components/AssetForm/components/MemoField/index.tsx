import { useState } from 'react';
import clsx from 'clsx';
import { Icon } from '~/components';
import { Text } from '~/components/UiKit';
import { StyledMemoLabel, StyledInput } from '../../styles';
import { TSelectedAsset } from '../../constants';

interface IMemoFieldProps {
  index: string;
  handleSelectAsset: (index: string, item?: Partial<TSelectedAsset>) => void;
}

export const MemoField: React.FC<IMemoFieldProps> = ({
  handleSelectAsset,
  index,
}) => {
  const [memo, setMemo] = useState('');
  const [memoExpanded, setMemoExpanded] = useState(false);

  const handleMemoChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    setMemo(target.value);
    handleSelectAsset(index, { memo });
  };

  return (
    <>
      <StyledMemoLabel
        onClick={() => setMemoExpanded((prev) => !prev)}
        $expanded={memoExpanded}
      >
        <Text size="medium" bold>
          Memo (Optional - this will be public)
        </Text>
        <Icon name="ExpandIcon" className={clsx('icon')} size="18px" />
      </StyledMemoLabel>
      {memoExpanded && (
        <StyledInput
          type="text"
          value={memo}
          onChange={handleMemoChange}
          placeholder="Enter movement memo"
          maxLength={32}
        />
      )}
    </>
  );
};

export default MemoField;
