import styled from 'styled-components';

export const StyledWrapper = styled.div`
  grid-area: balance;
  min-height: 392px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;
`;

export const StyledTotalBalance = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

export const StyledAsset = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledButtonGroup = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;

  & button {
    flex-grow: 1;
  }
`;
