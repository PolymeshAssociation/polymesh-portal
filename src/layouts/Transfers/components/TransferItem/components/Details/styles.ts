import styled from 'styled-components';

export const StyledInfoItem = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledVenueId = styled(StyledInfoItem)`
  position: relative;
  cursor: pointer;
  padding: 0 16px 4px 16px;

  &:hover {
    text-decoration: underline;
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

  & span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
