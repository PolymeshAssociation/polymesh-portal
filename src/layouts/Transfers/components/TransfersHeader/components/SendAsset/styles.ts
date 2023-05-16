import styled from 'styled-components';

export const StyledNavigation = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

export const InputWrapper = styled.div<{ marginBotom?: number }>`
  position: relative;
  width: 100%;
  margin-bottom: ${({ marginBotom }) => (marginBotom ? `${marginBotom}px` : 0)};
`;

export const FlexInputWrapper = styled.div<{ marginBotom?: number }>`
  display: flex;
  align-items: center;
  gap: 24px;
  margin-bottom: ${({ marginBotom }) => (marginBotom ? `${marginBotom}px` : 0)};

  @media screen and (max-width: 767px) {
    flex-direction: column;
  }
`;

export const StyledErrorMessage = styled.span`
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;

export const StyledAddButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 24px;
  margin-bottom: 32px;
  height: 40px;
  padding: 0 16px;
  background-color: transparent;
  color: #170087;

  &:disabled {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
