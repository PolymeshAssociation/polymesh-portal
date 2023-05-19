import styled from 'styled-components';

export const StyledSettings = styled.div`
  margin: 0 auto;
  padding: 24px;
  width: 600px;
  min-height: 300px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px ${({ theme }) => theme.colors.shadow};
  border-radius: 24px;
`;

export const StyledMenuList = styled.ul`
  & li:not(:first-child) {
    margin-top: 32px;
  }
`;
