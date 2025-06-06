import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 114px;
  gap: 4px;

  & .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  & .id-icon {
    color: ${({ theme }) => theme.colors.textPink};
  }

  & .copy-icon {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StyledLabel = styled.div`
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 24px;
  padding: 0 8px;
  gap: 8px;
  background-color: ${({ theme }) => theme.colors.warningBackground};
  color: ${({ theme }) => theme.colors.textWarning};
  border-radius: 100px;
  font-size: 12px;
`;
