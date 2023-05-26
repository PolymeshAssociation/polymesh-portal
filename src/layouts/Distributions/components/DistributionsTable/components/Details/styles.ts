import styled from 'styled-components';

export const StyledWrapper = styled.span<{ isExpanded: boolean }>`
  position: relative;
  display: flex;
  align-items: center;

  & .expand-icon {
    transform: ${({ isExpanded }) =>
      isExpanded ? 'rotate(180deg)' : 'rotate(0)'};
    transition: transform 250ms ease-out;
  }
`;

export const StyledExpandedDetails = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: max-content;
  padding: 24px;
  border-radius: 24px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  z-index: 2;

  @media screen and (min-width: 1024px) {
    width: 200%;
  }
`;

export const StyledDetailItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
  font-weight: 400;
  color: ${({ theme }) => theme.colors.textSecondary};
  &:not(:first-child) {
    margin-top: 8px;
  }

  & span {
    max-width: 60%;
    text-align: right;
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 500;
  }
`;
