import styled from 'styled-components';

export const StyledValue = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin: 0;
  padding: 0;
  background: transparent;
  border: none;
  color: inherit;
  font-size: inherit;
  font-weight: inherit;
  text-transform: capitalize;
  @media screen and (max-width: 1023px) {
    width: 100%;
  }
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 48px;
  @media screen and (min-width: 768px) {
    width: 440px;
  }
`;

export const StyledLabel = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 16px;
  background-color: #fbf3d0;
  color: #e3a30c;
  border-radius: 100px;
  font-size: 12px;
`;

export const StyledActionButton = styled.button<{ $marginTop?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  gap: 8px;
  margin-top: ${({ $marginTop }) => ($marginTop ? `${$marginTop}px` : 0)};
  padding: 0 16px;
  background-color: transparent;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textBlue};

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

export const StyledRememberSelected = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: space-between;
  padding-right: 16px;
`;

export const StyledSelect = styled.div<{ $isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ $isSelected }) =>
    $isSelected ? '#FF2E72' : 'transparent'};
  border: 2px solid
    ${({ $isSelected, theme }) =>
      $isSelected ? '#FF2E72' : theme.colors.textDisabled};
  color: ${({ $isSelected }) => ($isSelected ? '#FFFFFF' : 'transparent')};
  transition:
    background-color 250ms ease-out,
    color 250ms ease-out;
  cursor: pointer;
`;
