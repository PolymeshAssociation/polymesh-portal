import styled from 'styled-components';

export const StyledWrapper = styled.li`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const StyledDescription = styled.div`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 500;
  flex-grow: 1;
  @media screen and (min-width: 1024px) {
    display: flex;
    align-items: center;
  }
`;

export const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background-color: ${({ theme }) => theme.colors.pinkBackground};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textPink};
`;

export const StyledValue = styled.div`
  color: ${({ theme }) => theme.colors.textPink};
  font-weight: 500;
  margin-left: auto;
`;
