import styled from 'styled-components';

export const StyledNftsCell = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 2px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StyledDivider = styled.div`
  padding-left: 2px;
`;

export const StyledDots = styled.div`
  width: 22px;
  height: 22px;
  text-align: center;
  font-size: 20px;
  line-height: 0.5;
  border: 1px solid ${({ theme }) => theme.colors.shadow};
  background: ${({ theme }) => theme.colors.dashboardBackground};
  border-radius: 50%;
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: opacity 250ms ease-out;
  &:hover {
    opacity: 0.6;
  }
`;
