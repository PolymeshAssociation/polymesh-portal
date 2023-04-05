import styled from 'styled-components';

export const StyledAuthorizationsList = styled.ul`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 36px;
`;

export const AuthorizationPlaceholder = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 162px;
  background-color: ${({ theme }) => theme.colors.landingBackground};
  box-shadow: 0px 20px 40px rgba(30, 30, 30, 0.1);
  border-radius: 32px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;