import styled from 'styled-components';

export const StyledDetailsContainer = styled.div`
  background-color: ${({ theme }) => theme.colors.landingBackground};
  flex: 2;
  border-radius: 24px;
  @media screen and (max-width: 1572px) {
    width: 100%;
  }
`;

export const StyledId = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 2px solid ${({ theme }) => theme.colors.shadow};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 24px;
  font-weight: 600;
`;

export const StyledInfo = styled.div`
  padding: 24px 24px 0;
  margin-bottom: 24px;
  overflow-y: scroll;
  max-height: calc(100vh - 411px);
  min-height: 220px;
`;

export const StyledInfoItem = styled.div`
  border: 1px solid ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
  background-color: unset;
  &:not(:last-child) {
    margin-bottom: 24px;
  }
`;

export const StyledInfoItemLabelWrap = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 2px;
`;

export const StyledInfoItemLabel = styled.div`
  font-size: 10px;
  padding: 2px 8px;
  border-radius: 24px;
  color: ${({ theme }) => theme.colors.textPink};
  background: ${({ theme }) => theme.colors.lightAccent};
`;

export const StyledInfoItemHeader = styled.div<{
  $expanded: boolean;
  $isEmpty?: boolean;
}>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  cursor: ${({ $isEmpty }) => ($isEmpty ? 'initial' : 'pointer')};
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 600;
  & .expand-icon {
    height: 18px;
    transform: ${({ $expanded }) =>
      $expanded ? `rotate(180deg)` : `rotate(0)`};
  }
`;

export const StyledInfoBlockWrap = styled.div`
  padding: 16px;
  border-top: 1px solid ${({ theme }) => theme.colors.shadow};
`;

export const StyledInfoBlock = styled.div<{ $withoutBackground?: boolean }>`
  border-radius: 24px;
  background-color: ${({ $withoutBackground, theme }) =>
    $withoutBackground ? '' : theme.colors.shadow};
`;

export const StyledInfoBlockItem = styled.div`
  padding: 16px;
  font-size: 16px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  &:not(:first-child) {
    border-top: 1px solid ${({ theme }) => theme.colors.landingBackground};
  }
`;

export const StyledInfoHeaderWrap = styled.div<{ $expanded: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  & .expand-icon {
    cursor: pointer;
    transform: ${({ $expanded }) =>
      $expanded ? 'rotate(180deg)' : 'rotate(0)'};
  }
`;

export const StyledInfoBlockHead = styled.div`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledInfoBlockDescription = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  overflow: hidden;
`;

export const StyledInfoBlockText = styled.div<{ $isPink: boolean }>`
  overflow-wrap: break-word;
  word-wrap: break-word;
  word-break: break-word;
  color: ${({ theme, $isPink }) =>
    $isPink ? theme.colors.textPink : 'inherit'};
  & > a {
    cursor: pointer;
    word-wrap: break-word;
    word-break: break-all;
  }
`;

export const StyledTooltipWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

export const StyledBlockHeaderCapitalized = styled(StyledInfoBlockHead)`
  text-transform: capitalize;
`;

export const StyledTooltipsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledDocumentWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;
