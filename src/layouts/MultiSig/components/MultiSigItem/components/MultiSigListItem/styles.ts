import styled from 'styled-components';

export const StyledCard = styled.div`
  width: 100%;
  padding: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 32px;
  margin-bottom: 36px;
`;

export const StyledButtonsWrapper = styled.div<{ $expanded: boolean }>`
  display: flex;
  gap: 24px;
  & > button:not(:last-child) {
    flex-grow: 1;
  }
  & > button:last-child {
    @media screen and (max-width: 528px) {
      width: 100%;
    }
  }
  & .expand-icon {
    transform: ${({ $expanded }) =>
      $expanded ? `rotate(180deg)` : `rotate(0)`};
  }
  @media screen and (max-width: 1023px) {
    flex-wrap: wrap-reverse;
  }
`;
