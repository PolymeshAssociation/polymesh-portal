import styled from 'styled-components';

export const StyledLink = styled.a`
  color: ${({ theme }) => theme.colors.textPink};
  text-decoration: underline;
  cursor: pointer;
  &:hover {
    text-decoration: none;
  }
`;

export const ConsentRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
`;

export const ConsentCheckbox = styled.input`
  accent-color: ${({ theme }) => theme.colors.textPink};
  width: 16px;
  height: 16px;
`;
