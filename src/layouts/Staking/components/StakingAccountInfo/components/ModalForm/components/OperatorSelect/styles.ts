import styled from 'styled-components';

export const StyledNominationContainer = styled.div`
  margin-top: 16px;
  display: flex;
  gap: 16px;
  flex-direction: column;
`;

export const StyledNominationWrapper = styled.div`
  flex: 1;
`;

export const StyledOperatorSelect = styled.div`
  padding: 4px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  height: 106px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;

  @media screen and (max-width: 600px) {
    height: 80px;
  }
`;

export const StyledNominatorOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: space-between;
  width: 100%;
  font-size: 14px;
  cursor: pointer;

  .left-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .right-content {
    text-align: right;
  }
`;

export const StyledSelectedHeadWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const StyledActionButton = styled.button<{ $marginTop?: number }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-top: ${({ $marginTop }) => ($marginTop ? `${$marginTop}px` : 0)};
  margin-left: auto;
  padding: 0 16px;
  background-color: transparent;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textBlue};

  &:disabled {
    color: ${({ theme }) => theme.colors.textDisabled};
  }
`;

export const StyledSelected = styled.div`
  padding: 4px;
  border: 1px solid #8f8f8f;
  border-radius: 8px;
  height: 106px;
  overflow-y: auto;
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  align-content: flex-start;

  @media screen and (max-width: 600px) {
    height: 80px;
  }
`;

export const StyledSelectedOption = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  padding: 2px 4px;
  font-size: 14px;
  border-radius: 12px;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};
`;

export const StyledIconWrapper = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
`;
