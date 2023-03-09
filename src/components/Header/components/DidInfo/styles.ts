import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 114px;
  gap: 4px;

  & .id-icon {
    color: #ff2e72;
  }

  & .copy-icon {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
