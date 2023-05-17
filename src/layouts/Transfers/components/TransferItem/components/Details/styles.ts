import styled from 'styled-components';

export const StyledInfoItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media screen and (max-width: 1023px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    gap: 8px;
    & p {
      text-align: right;
    }
  }

  @media screen and (min-width: 1024px) and (max-width: 1199px) {
    font-size: 10px;
    & p {
      font-size: 14px;
    }
  }
`;

export const StyledVenueId = styled(StyledInfoItem)`
  position: relative;
  cursor: pointer;
  padding: 0 16px 4px 16px;

  &:hover {
    text-decoration: underline;
  }

  @media screen and (max-width: 1023px) {
    padding: 0;
  }
`;

export const StyledVenueDetails = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  padding: 16px;
  min-width: 160px;
  max-width: 50vw;
  max-height: 300px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 24px;
  border: 1px solid #c8c8c8;
  overflow-y: scroll;
  z-index: 1;

  & span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
