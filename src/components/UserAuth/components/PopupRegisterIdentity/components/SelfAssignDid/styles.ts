import styled from 'styled-components';

export const StyledSelfAssignContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 24px;
  width: 100%;
`;

export const StyledSelfAssignInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StyledSelfAssignStatus = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  text-align: center;

  .success-icon {
    color: ${({ theme }) => theme.colors.textSuccess};
  }
`;
