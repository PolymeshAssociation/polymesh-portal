import styled from 'styled-components';

export const StyledWalletSelectContainer = styled.div`
  width: 100%;
  height: 180px;
  position: relative;
  & > div {
    border-radius: 8px;
    & > div {
      text-align: left;
      border: 1px solid #8f8f8f;
      border-radius: 8px;
      color: ${({ theme }) => theme.colors.textPrimary};
      & > div > div {
        color: ${({ theme }) => theme.colors.textSecondary};
      }
    }
  }
  & > div > div:nth-child(2) {
    width: 100%;
    left: 0;
  }
`;
