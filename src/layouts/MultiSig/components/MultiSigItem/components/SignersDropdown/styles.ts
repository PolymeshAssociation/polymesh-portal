import styled from 'styled-components';

export const StyledSignersContainer = styled.div`
  border-radius: 24px;
  border: 1px solid #e6e6e6;
  overflow: hidden;
  margin: 24px 0;
  & table {
    border-top: 1px solid ${({ theme }) => theme.colors.shadow};
  }
`;

export const StyledHeader = styled.div<{ $expanded: boolean }>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  padding: 16px 24px;
  cursor: pointer;
  font-weight: 500;
  & .expand-icon {
    height: 18px;
    transform: ${({ $expanded }) =>
      $expanded ? `rotate(180deg)` : `rotate(0)`};
  }
  // to override default table border-radius
  & + div {
    border-radius: 0;
  }
`;

export const StyledAddressWrap = styled.div`
  display: flex;
  gap: 10px;
`;

export const StyledLink = styled.a`
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPink};
  text-decoration: underline;
  cursor: pointer;
`;

export const StyledStatusHeader = styled.div`
  padding-right: 24px;
  margin-left: auto;
  text-align: right;
  width: 116px;
  @media screen and (max-width: 1023px) {
    text-align: left;
  }
`;

export const StyledStatusWrap = styled.div`
  margin-left: auto;
  padding-right: 24px;
  width: 116px;
  @media screen and (max-width: 1023px) {
    padding-right: 0;
    width: 92px;
  }
`;

export const StyledStatus = styled.div`
  text-transform: capitalize;
  font-size: 12px;
  padding: 4px 16px;
  text-align: center;
  border-radius: 100px;
  font-weight: 500;
  width: 92px;
  &.approved {
    background-color: #D4F7E7;
    color: #00aa5e;
  }
  &.rejected {
    background-color: #fae6e8;
    color: #db2c3e;
  }
  &.pending {
    background-color: #170087;
    color: #ffffff;
  }
`;
