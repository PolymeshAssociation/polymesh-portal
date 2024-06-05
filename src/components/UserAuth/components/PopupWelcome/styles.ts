import styled from 'styled-components';
import connectBackground from '~/assets/connect-bg.svg';
import connectBackgroundMobile from '~/assets/connect-bg-mobile.svg';

export const StyledWelcomeWrapper = styled.div`
  width: 976px;
  height: 332px;
  overflow: hidden;
  padding: 8px;
  &:before {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    z-index: 1;
    background: #000000;
    border-radius: 8px;
  }
  &:after {
    content: '';
    display: block;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    border-radius: 8px;
    z-index: 2;
    background-image: url(${connectBackground});
    background-size: cover;
  }
  @media screen and (max-width: 1080px) {
    max-width: 600px;
    height: fit-content;
  }
  @media screen and (max-width: 768px) {
    max-width: 100%;
    width: 100%;
    padding: 0;
    &::after {
      background-image: url(${connectBackgroundMobile});
    }
  }
`;

export const StyledWelcomePopup = styled.div`
  padding: 0 0 0 230px;
  color: #ffffff;
  display: flex;
  flex-direction: column;
  gap: 18px;
  position: relative;
  z-index: 5;
  & > p:first-of-type {
    margin-top: -20px;
  }
  @media screen and (max-width: 1080px) {
    padding: 0 0 0 160px;
  }
  @media screen and (max-width: 768px) {
    padding: 0;
  }
`;

export const StyledButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  padding-top: 16px;
  & > .transparent-btn {
    background: transparent;
    transition: opacity 250ms ease-out;
    &:hover {
      background: transparent;
      opacity: 0.8;
    }
  }
  @media screen and (max-width: 540px) {
    flex-direction: column-reverse;
    & > button {
      width: 100%;
    }
  }
`;
