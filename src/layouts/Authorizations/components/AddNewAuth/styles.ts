import styled from 'styled-components';

export const StyledTypeSelectWrapper = styled.div`
  position: relative;
  padding: 9px 16px;
  width: 100%;
  cursor: pointer;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
`;

export const StyledTypeSelect = styled.div<{
  $isSelected: boolean;
  $expanded: boolean;
}>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;

  & span {
    font-size: 14px;
    color: ${({ theme, $isSelected }) =>
      $isSelected ? theme.colors.textPrimary : theme.colors.textSecondary};
  }
  & div {
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: transform 250ms ease-out;
    ${({ $expanded }) =>
      $expanded ? `transform: rotate(180deg);` : 'transform: rotate(0);'}
  }
`;

export const StyledExpandedTypeSelect = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-top: 4px;
  padding: 8px;
  max-height: 200px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  overflow-y: auto;
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
`;

export const StyledTypeOption = styled.button<{ $isSelected?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 16px;
  border-radius: 16px;
  background-color: ${({ theme, $isSelected }) =>
    $isSelected
      ? theme.colors.dashboardBackground
      : theme.colors.landingBackground};
  font-size: 14px;
  text-align: left;
  transition: background-color 250ms ease-out;
  color: ${({ theme }) => theme.colors.textPrimary};

  &:hover:enabled {
    background-color: ${({ theme }) => theme.colors.dashboardBackground};
  }
  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
  &:not(:first-child) {
    margin-top: 8px;
  }
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 32px;
`;

export const StyledInputGroup = styled.div`
  margin-top: 16px;

  @media screen and (max-width: 767px) {
    & > div:not(:first-child) {
      margin-top: 16px;
    }
  }

  @media screen and (min-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
    align-items: center;
    column-gap: 24px;
    row-gap: 16px;
  }
`;

export const InputWrapper = styled.div<{ $isSelect: boolean }>`
  ${({ $isSelect }) => ($isSelect ? `grid-column: 1 / 3;` : '')}
  position: relative;
`;

export const StyledInput = styled.input`
  outline: none;
  width: 100%;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 9px 16px;
  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &[type='date'] {
    font-family: inherit;
    padding: 6px 16px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledSelectWrapper = styled.div`
  position: relative;
  cursor: pointer;
`;

export const StyledSelect = styled.div<{
  $expanded: boolean;
  $isSelected: boolean;
}>`
  width: 100%;
  height: 36px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  padding: 6px 16px;
  font-size: 14px;
  color: ${({ $isSelected, theme }) =>
    $isSelected ? theme.colors.textSecondary : theme.colors.textPrimary};

  & .icon {
    position: absolute;
    bottom: 10px;
    right: 16px;
    color: ${({ theme }) => theme.colors.textSecondary};
    transition: transform 250ms ease-out;
    ${({ $expanded }) =>
      $expanded ? `transform: rotate(180deg);` : 'transform: rotate(0);'}
  }
`;

export const StyledLabel = styled.label`
  display: block;
  margin-bottom: 3px;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledErrorMessage = styled.span`
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;

export const StyledWarningMessage = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: rgb(255, 196, 12);
  line-height: 1;
`;

export const SoonLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 63px;
  height: 24px;
  background-color: #f2efff;
  border-radius: 100px;
  font-weight: 500;
  font-size: 12px;
  color: #43195b;
`;

export const StyledLink = styled.a`
  display: 'inline';
  font-size: 'inherit';
  vertical-align: 'baseline';
  text-decoration: underline;
  cursor: pointer;
  color: ${({ theme }) => theme.colors.textPink};
  &:hover {
    color: ${({ theme }) => theme.colors.textPurple};
  }
`;
