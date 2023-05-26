import styled from 'styled-components';

export const StyledWrapper = styled.div<{ main?: boolean }>`
  width: 100%;
  height: ${({ main }) => (main ? '100vh' : '100%')};
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${({ theme }) => theme.colors.dashboardBackground};

  & .skeleton {
    display: flex;
    gap: 12px;
  }
`;
