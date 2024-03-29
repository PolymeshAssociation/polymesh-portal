import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.textPink};
  color: ${({ theme }) => theme.colors.landingBackground};
  font-size: 12px;
`;
