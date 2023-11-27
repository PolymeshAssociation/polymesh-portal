import styled from 'styled-components';

export const StyledStatusLabel = styled.div`
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 12px;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textPink};
  font-weight: 500;
  background: ${({ theme }) => theme.colors.landingBackground};
  border-radius: 24px;
  padding: 2px 16px;
`;
