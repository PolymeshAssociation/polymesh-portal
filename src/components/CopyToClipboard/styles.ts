import styled from 'styled-components';

export const StyledCopyWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  & .check-icon {
    width: 16px;
    height: 16px;
    transform: scale(1.1);
    &.success {
      color: #00aa5e;
    }
    &.failure {
      color: #db2c3e;
    }
  }
`;
