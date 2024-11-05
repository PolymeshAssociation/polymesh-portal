import styled from 'styled-components';
import { StyledInput } from '../../styles';

export const AssetWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const IconWrapper = styled.div<{ $background: string }>`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background-color: ${({ $background }) => $background};
  color: #ffffff;
`;

export const InputWrapper = styled.div`
  position: relative;
`;

export const StyledAmountInput = styled(StyledInput)`
  padding: 9px 80px 9px 16px;
`;

export const StyledAvailableBalance = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const UseMaxButton = styled.button`
  position: absolute;
  top: 0;
  right: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.textBlue};
`;
