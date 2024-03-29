import styled from 'styled-components';

export const StyledWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  min-width: 118px;
  padding-left: 8px;
  white-space: nowrap;
`;

export const StyledPriceLabel = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
`;
