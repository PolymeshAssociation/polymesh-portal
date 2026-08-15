import { EActionButtonStatus } from '../../constants';

export const getActionLabelColor = (status?: EActionButtonStatus) => {
  switch (status) {
    case EActionButtonStatus.ACTION_ACTIVE:
      return '#ffffff';
    case EActionButtonStatus.ACTION_DISABLED:
      return '#ADADAD';
    case EActionButtonStatus.ACTION_DONE:
      return '#000000';
    default:
      return '#ffffff';
  }
};
