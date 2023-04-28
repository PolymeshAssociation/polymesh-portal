import { ClaimType } from '@polymeshassociation/polymesh-sdk/types';
import { useState } from 'react';
import { Toggler, Text } from '~/components/UiKit';
import { ISelectedClaimItem } from '../../constants';
import { StyledInput, StyledInputWrapper, StyledLabel } from '../../styles';
import { StyledWrapper, StyledTopInfo } from './styles';

interface INewClaimItem {
  label: string;
  value: ClaimType;
  handleAdd: (newClaim: ISelectedClaimItem) => void;
  handleDelete: (claimType: ClaimType) => void;
}

export const NewClaimItem: React.FC<INewClaimItem> = ({
  label,
  value,
  handleAdd,
  handleDelete,
}) => {
  const [isSelected, setIsSelected] = useState(false);
  const [expiry, setExpiry] = useState<Date | null>(null);

  const handleToggle = (toggleState: boolean) => {
    setIsSelected(toggleState);
    if (toggleState) {
      handleAdd({ claimType: value, expiry });
    } else {
      handleDelete(value);
      setExpiry(null);
    }
  };

  const handleDateChange: React.ChangeEventHandler<HTMLInputElement> = ({
    target,
  }) => {
    const date = target.valueAsDate;
    setExpiry(date);

    if (isSelected) {
      handleAdd({ claimType: value, expiry: date });
    }
  };

  return (
    <StyledWrapper>
      <StyledTopInfo>
        <Text bold>{label}</Text>
        <Toggler
          id={value}
          isEnabled={isSelected}
          handleChange={handleToggle}
        />
      </StyledTopInfo>
      {isSelected && (
        <StyledInputWrapper marginTop={20}>
          <StyledLabel>Expiry Date (Optional)</StyledLabel>
          <StyledInput
            type="date"
            onChange={handleDateChange}
            min={new Date().toISOString().split('T')[0]}
          />
        </StyledInputWrapper>
      )}
    </StyledWrapper>
  );
};
