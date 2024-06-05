import styled from 'styled-components';

export const StyledExtensionInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 648px;
`;

export const StyledExtensionInfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const StyledExtensionItemNumber = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 100%;
  border: ${({ theme }) => `1px solid ${theme.colors.shadow}`};
  font-weight: 700;
`;

export const StyledExtraBoldText = styled.span`
  font-weight: 700;
`;
