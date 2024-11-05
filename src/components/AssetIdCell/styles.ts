import styled from 'styled-components';

export const AssetIdCellWrapper = styled.span`
  display: flex;
  align-items: center;
  gap: 10px;
  text-transform: none;
  & div {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;
