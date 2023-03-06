import styled from 'styled-components';

export const StyledLogoBox = styled.div`
  padding: 38px 64px 0 64px;
`;

export const StyledInfoBox = styled.div`
  position: absolute;
  top: 50%;
  left: 15%;
  transform: translateY(-60%);
  max-width: 540px;
  padding-right: 40px;
  z-index: 1;

  @media only screen and (min-width: 1024px) {
    left: 22%;
  }
`;

export const StyledAnimationBox = styled.div`
  position: fixed;
  top: -230px;
  right: 0;
  width: 800px;
  opacity: 0.8;
`;
