import styled from 'styled-components';

export const StyledAgentDidCell = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  & span {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;
