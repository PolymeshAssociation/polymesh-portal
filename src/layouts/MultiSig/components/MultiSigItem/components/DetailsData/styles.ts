import styled from 'styled-components';

export const StyledInfo = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 36px;
  padding: 12px;
  margin-bottom: 24px;
  @media screen and (max-width: 1420px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const StyledInfoBlock = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  @media screen and (max-width: 1420px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &.right {
    text-align: right;
  }
  & span {
    display: block;
    font-size: 16px;
    font-weight: 500;
    &.capitalize {
      text-transform: capitalize;
    }
    @media screen and (max-width: 1560px) {
      font-size: 14px;
    }
  }
`;

export const StyledCopyWrap = styled.div`
  display: flex;
  gap: 4px;
`;

export const StyledInfoItem = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StyledInfoLink = styled.a`
  display: block;
  width: fit-content;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
  @media screen and (max-width: 1560px) {
    font-size: 14px;
  }
`;

export const StyledInfoItemPink = styled.span`
  color: ${({ theme }) => theme.colors.textPink};
`;

export const StyledInfoItemGreen = styled.span`
  color: ${({ theme }) => theme.colors.textSuccess};
`;

export const StyledApprovalItem = styled.div`
  text-transform: lowercase;
  display: flex;
  gap: 3px;
`;

export const StyledStatus = styled.div`
  padding: 2px 16px;
  font-size: 12px;
  border-radius: 100px;
  font-weight: 500;
  width: fit-content;
  &.success {
    background: ${({ theme }) => theme.colors.successBackground};
    color: ${({ theme }) => theme.colors.textSuccess};
  }
  &.failed,
  &.deleted,
  &.rejected {
    background: #fae6e8;
    color: #db2c3e;
  }
`;
