import styled from 'styled-components';

export const StyledContainerBox = styled.div`
  position: relative;
  max-width: 1440px;
  height: 100%;
  padding: 38px 64px 0 64px;
  margin: 0 auto;
`;

export const StyledInfoBox = styled.div`
  position: absolute;
  top: 50%;
  left: 18%;
  transform: translateY(-60%);
  max-width: 540px;
  padding-right: 40px;
  z-index: 1;
`;

export const StyledAnimationBox = styled.div`
  position: fixed;
  top: -230px;
  right: 0;
  width: 800px;
  opacity: 0.8;
`;
