import styled from 'styled-components';

export const StyledInfoBlock = styled.div`
  & span {
    display: block;
    &:first-child {
      margin-bottom: 2px;
      @media screen and (max-width: 1420px) {
        margin-bottom: 0;
      }
    }
  }
  & br {
    display: none;
  }
  margin-bottom: 2px;
  @media screen and (max-width: 1420px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &.right {
    & span {
      @media screen and (min-width: 1421px) {
        margin-left: auto;
      }
    }
  }
`;

export const StyledEmptyText = styled.div`
  height: 138px;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 16px;
`;

export const StyledButtonsWrapper = styled.div`
  display: flex;
  gap: 24px;
  margin-top: -11px;
  & > span {
    display: block;
    &:last-child {
      max-width: 128px;
    }
  }
`;
