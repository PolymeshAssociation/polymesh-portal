import styled from 'styled-components';
import { EActionButtonStatus } from '../../constants';
import { getActionLabelColor } from './helpers';
import { MatomoData } from '~/helpers/matomoTags';

export const StyledActionButtonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
`;

export const StyledActionButton = styled.button<{
  $status: EActionButtonStatus;
  matomoData?: MatomoData;
}>`
  display: flex;
  gap: 8px;
  align-items: center;
  justify-content: center;
  border: 1px solid;
  border-radius: 16px;
  padding: 31px 8px;
  transition: all 250ms ease-out;
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
    color: ${({ $status }) =>
      $status === EActionButtonStatus.ACTION_PENDING
        ? '#ffffff'
        : getActionLabelColor($status)};
    & > svg {
      fill: transparent;
    }
  }
  &:hover {
    background-color: ${({ $status }) =>
      $status === EActionButtonStatus.ACTION_DISABLED
        ? 'rgba(0, 0, 0, 0.4)'
        : '#ffffff'};
    border-color: ${({ $status }) =>
      $status === EActionButtonStatus.ACTION_DISABLED ? '#ADADAD' : '#ff2e72'};
    & > div,
    & > div > span {
      color: ${({ $status }) =>
        $status === EActionButtonStatus.ACTION_DISABLED
          ? '#ADADAD'
          : '#FF2E72'};
    }
  }
`;

export const StyledActionLabelWrap = styled.div`
  display: flex;
  gap: 8px;
`;

export const StyledActionLabel = styled.span<{
  $status?: EActionButtonStatus;
  $underlined?: boolean;
}>`
  font-size: 16px;
  font-weight: 500;
  color: ${({ $status }) =>
    $status ? getActionLabelColor($status) : '#ffffff'};
  text-decoration: ${({ $underlined }) => ($underlined ? 'underline' : 'none')};
`;
