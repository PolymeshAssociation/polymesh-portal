import styled from 'styled-components';

export const StyledProviderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 24px;
  width: 992px;
  @media screen and (max-width: 1080px) {
    width: fit-content;
    gap: 24px;
  }
  @media screen and (max-width: 768px) {
    flex-direction: column;
    width: 100%;
  }
`;

export const StyledProviderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 618px;
`;

export const StyledProviderNameContainer = styled.div`
  display: flex;
  gap: 8px;
`;

export const StyledProviderName = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const StyledProviderStepsList = styled.ul`
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-left: 16px;
  & > li {
    list-style-type: disc;
  }
`;

export const StyledQRCodeContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  border: ${({ theme }) => `1px solid ${theme.colors.shadow}`};
  padding: 16px;
  border-radius: 16px;
  align-items: center;
  width: 100%;
  @media screen and (min-width: 767px) {
    max-width: 350px;
  }
`;

export const StyledQRCode = styled.div`
  display: flex;
  width: fit-content;
  align-self: center;
  border-radius: 16px;
  padding: 16px;
  background-color: #ffffff;
  display: inline-flex;
  gap: 4px;

  &:hover {
    cursor: pointer;
  }
  &:active {
    cursor: none;
  }
`;
