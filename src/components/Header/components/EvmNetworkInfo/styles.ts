import styled from 'styled-components';

export const StyledWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  &:hover {
    background-color: ${({ theme }) => theme.colors.lightAccent};
  }

  & .sub-icon {
    color: #ffffff;
    position: absolute;
    top: 2px;
    right: 2px;
    background-color: #db2c3e;
    border-radius: 50%;
    padding: 2px;
  }
`;

export const StyledModalContent = styled.section`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 520px;
`;

export const StyledHeading = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StyledDescription = styled.p`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;
`;

export const StyledButtonWrapper = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
`;
