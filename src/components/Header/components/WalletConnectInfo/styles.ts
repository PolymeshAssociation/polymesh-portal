import styled from 'styled-components';

export const StyledWrapper = styled.div<{ $expanded: boolean }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textSecondary};
  & .background {
    fill: ${({ theme }) => theme.colors.textSecondary};
  }
  & .foreground {
    fill: ${({ theme }) => theme.colors.dashboardBackground};
  }
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightAccent};
  }

  & .sub-icon {
    color: #ffffff;
    position: absolute;
    top: 2px;
    right: 2px;
    background-color: #00aa5e;
    border-radius: 50%;
    padding: 2px;
  }
`;

export const StyledModalContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 640px;
`;

export const StyledHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: justify;
`;

export const StyledDescription = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
  flex-grow: 1;
  gap: 6px;
  margin: 6px;
  @media screen and (min-width: 768px) {
    min-width: 400px;
    display: flex;
  }
`;

export const StyledValue = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: justify;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 400;
  margin-left: auto;
`;
