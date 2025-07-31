import styled from 'styled-components';
import connectBackground from '~/assets/connect-bg.svg';

export const StyledAuthContainer = styled.section`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: 24px;
  padding: 24px;
  background: black;
  margin-bottom: 36px;
  background-image: url(${connectBackground});
  background-size: cover;
  color: #ffffff;
`;

export const StyledAuthHeaderWrap = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
`;

export const StyledAuthHeader = styled.h1`
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
`;

export const StyledCloseButton = styled.button`
  margin-left: auto;
  width: fit-content;
  height: 20px;
  cursor: pointer;
  background: transparent;
  transition: opacity 250ms ease-out;
  &:hover {
    opacity: 0.8;
  }
`;

export const StyledAuthButtons = styled.div`
  display: flex;
  gap: 16px;
  @media screen and (max-width: 520px) {
    flex-direction: column;
  }
`;
