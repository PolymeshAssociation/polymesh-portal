import styled from 'styled-components';

export const StyledPopupHeaderWrap = styled.div<{ $isWide: boolean }>`
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 648px;
  max-width: ${({ $isWide }) => ($isWide ? '992px' : '648px')};
`;

export const StyledPopupHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  & .close-btn {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledPopupTitle = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  & > .title-icon {
    color: ${({ theme }) => theme.colors.textPrimary};
    & > svg {
      fill: transparent;
    }
  }
`;
