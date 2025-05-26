import React, { useContext, useState } from 'react';
import { AccountContext } from '~/context/AccountContext';
import { Modal } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { StyledLink, ConsentRow, ConsentCheckbox } from './styles';

interface GetPolyxProps {
  toggleModal: () => void;
}

export const GetPolyx: React.FC<GetPolyxProps> = ({ toggleModal }) => {
  const { selectedAccount } = useContext(AccountContext);
  const [consentChecked, setConsentChecked] = useState(false);

  const banxaBaseUrl = import.meta.env.VITE_BANXA_URL;

  const banxaUrl = `${banxaBaseUrl}?coinType=POLYX&blockchain=POLYX&walletAddress=${encodeURIComponent(selectedAccount)}&orderType=BUY`;

  const handleContinue = () => {
    window.open(banxaUrl, '_blank', 'noreferrer');
    toggleModal();
  };

  return (
    <Modal handleClose={toggleModal}>
      <Heading type="h4" marginBottom={24}>
        Get POLYX via Banxa
      </Heading>
      <Text size="small" marginBottom={16}>
        You are now leaving Polymesh Portal and will be redirected to Banxa
        (banxa.com), a third-party platform. Your wallet address will be shared
        with Banxa to facilitate your purchase. Banxa operates under its own{' '}
        <StyledLink
          href="https://banxa.com/terms-of-use"
          target="_blank"
          rel="noopener noreferrer"
        >
          Terms of Service
        </StyledLink>{' '}
        and{' '}
        <StyledLink
          href="https://banxa.com/privacy-policy"
          target="_blank"
          rel="noopener noreferrer"
        >
          Privacy Policy
        </StyledLink>
        . Polymesh is not responsible if issues are encountered. For support,
        visit the{' '}
        <StyledLink
          href="https://support.banxa.com/en/support/home"
          target="_blank"
          rel="noopener noreferrer"
        >
          Banxa Support site
        </StyledLink>
        .
      </Text>
      <ConsentRow>
        <ConsentCheckbox
          type="checkbox"
          id="banxa-consent"
          checked={consentChecked}
          onChange={(e) => setConsentChecked(e.target.checked)}
        />
        <Text size="small" color="secondary">
          By checking this box, I consent to share my wallet address with Banxa
          to facilitate my purchase in accordance with their Privacy Policy.
        </Text>
      </ConsentRow>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
        <Button variant="modalSecondary" onClick={toggleModal}>
          Cancel
        </Button>
        <Button
          variant="modalPrimary"
          onClick={handleContinue}
          disabled={!consentChecked}
        >
          Continue
        </Button>
      </div>
    </Modal>
  );
};
