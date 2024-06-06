import styled from 'styled-components';

export const StyledProviderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 992px;
`;

export const StyledProviderInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
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
  max-width: 320px;
  & > li {
    list-style-type: disc;
  }
`;
