import styled from 'styled-components';

export const StyledAccountWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
`;

export const IconWrapper = styled.div<{ size?: string }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${({ size }) => size || '32px'};
  height: ${({ size }) => size || '32px'};
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.landingBackground};

  & .id-icon {
    color: ${({ theme }) => theme.colors.textPink};
  }
  & .copy-icon {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledTopInfo = styled.div`
  position: relative;
  display: flex;
  align-content: center;
  justify-content: center;
  gap: 12px;

  & .did-wrapper {
    flex-grow: 1;
  }
`;

export const StyledDidWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StyledDidThumb = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  border-radius: 32px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;

export const StyledVerifiedLabel = styled.div`
  position: absolute;
  top: 0;
  right: 0;
  display: flex;
  align-content: center;
  justify-content: center;
  width: 54px;
  height: 16px;
  border-radius: 4px;
  background-color: ${({ theme }) => theme.colors.successBackground};
  color: ${({ theme }) => theme.colors.textSuccess};
  font-size: 12px;
`;

export const StyledBottomData = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  & span {
    font-weight: 500;
    color: ${({ theme }) => theme.colors.textPrimary};
    text-transform: capitalize;
  }
`;

export const StyledBottomInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const Separator = styled.div`
  width: 1px;
  height: 24px;
  background-color: #e6e6e6;
`;

export const StyledKeysList = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
export const StyledKeyData = styled.li`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 24px;
`;

export const KeyInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .name-container,
  .status-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
`;

export const KeyDetails = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  /* margin-top: 10px; */

  & .key-wrapper {
    flex-grow: initial;
    padding: 0 12px;
  }
`;

export const StyledBalance = styled.p`
  margin-left: auto;
  font-weight: 500;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};

  & span {
    font-weight: 400;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledLabel = styled.div<{
  isPrimary?: boolean;
  available?: boolean;
}>`
  /* position: absolute;
  top: 24px;
  right: 24px; */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  height: 24px;
  padding: 0 8px;
  border-radius: 100px;
  font-weight: 500;
  font-size: 12px;
  ${({ isPrimary, theme }) =>
    isPrimary
      ? `
    border: 1px solid #FAD1DC;
    color: ${theme.colors.textPink};
  `
      : `
    border: 1px solid #DCD3FF;
    color: ${theme.colors.textBlue};
  `}
  ${({ available, theme }) =>
    available
      ? `
    place-self: flex-end;
    border: 1px solid ${theme.colors.successBackground};
    background-color: ${theme.colors.successBackground};
    color: ${theme.colors.textSuccess};
  `
      : ''}
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  margin-top: 24px;
`;

export const StyledSelect = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background-color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.textPink : 'transparent'};
  border: 2px solid
    ${({ isSelected, theme }) =>
      isSelected ? theme.colors.textPink : theme.colors.textDisabled};
  color: ${({ isSelected, theme }) =>
    isSelected ? theme.colors.landingBackground : 'transparent'};
  transition: background-color 250ms ease-out, border 250ms ease-out,
    color 250ms ease-out;
  cursor: pointer;
`;
