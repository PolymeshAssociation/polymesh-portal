import styled from 'styled-components';

export const StyledSuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  & + .back-btn {
    margin: 0 auto 16px;
  }
`;
