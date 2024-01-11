import styled from 'styled-components';

export const StyledButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 24px;
  // padding to prevent help button covering button group on mobile
  @media screen and (max-width: 480px) {
    padding-bottom: 50px;
  }
`;
