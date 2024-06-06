import styled from 'styled-components';
import { EActionButtonStatus } from '../../constants';
import { getActionLabelColor } from './helpers';

export const StyledActionButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const StyledActionButton = styled.button<{
  $status: EActionButtonStatus;
}>`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 16px;
  padding: 31px 8px;
  border-color: ${({ $status }) =>
    $status === EActionButtonStatus.ACTION_DONE
      ? '#ffffff'
      : getActionLabelColor($status)};
  background-color: ${({ $status }) =>
    $status === EActionButtonStatus.ACTION_DONE
      ? '#ffffff'
      : 'rgba(0, 0, 0, 0.4)'};
  cursor: ${({ $status }) =>
    $status === EActionButtonStatus.ACTION_DISABLED ? 'auto' : 'pointer'};

  & .icon {
    color: ${({ $status }) => getActionLabelColor($status)};
    & > svg {
      fill: transparent;
    }
  }
`;

export const StyledActionLabelWrap = styled.div`
  display: flex;
  gap: 2px;
`;

export const StyledActionLabel = styled.span<{ $status?: EActionButtonStatus }>`
  font-size: 16px;
  font-weight: 500;
  color: ${({ $status }) =>
    $status ? getActionLabelColor($status) : '#ffffff'};
`;
