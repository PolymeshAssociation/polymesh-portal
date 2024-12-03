import { useContext, useCallback } from 'react';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import { notifyWarning } from '~/helpers/notifications';
import AuthContext from '~/context/AuthContext/context';

const StyledConnectWalletSpan = styled.span`
  color: ${({ theme }) => theme.colors.textPink};
  cursor: pointer;
  &:hover {
    color: ${({ theme }) => theme.colors.textPurple};
  }
`;

export const useExternalKeyWarningToast = () => {
  const { setConnectPopup } = useContext(AuthContext);

  const showExternalKeyWarningToast = useCallback(() => {
    notifyWarning(
      <>
        An external key is selected. The portal is in view-only mode. Please{' '}
        <StyledConnectWalletSpan
          onClick={() => setConnectPopup('extensions')}
          data-event-category="onboarding"
          data-event-action="connect-wallet"
          data-event-name="external-key-warning"
        >
          connect a wallet
        </StyledConnectWalletSpan>{' '}
        to submit transactions.
      </>,
      { autoClose: false, toastId: 'external-key-warning' },
    );
  }, [setConnectPopup]);

  const hideExternalKeyWarningToast = useCallback(() => {
    toast.dismiss('external-key-warning');
  }, []);

  return { showExternalKeyWarningToast, hideExternalKeyWarningToast };
};
