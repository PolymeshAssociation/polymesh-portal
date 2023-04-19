import styled from 'styled-components';

export const StyledNavigation = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
`;

export const InputWrapper = styled.div<{ marginBotom?: number }>`
  position: relative;
  margin-bottom: ${({ marginBotom }) => (marginBotom ? `${marginBotom}px` : 0)};
`;

export const StyledErrorMessage = styled.span`
  position: absolute;
  top: 100%;
  left: 0;
  font-size: 12px;
  font-weight: 500;
  color: #db2c3e;
`;
