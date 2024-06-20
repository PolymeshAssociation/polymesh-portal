import { useContext, useState } from 'react';
import { Modal, Icon } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { IPFS_PROVIDER_URL } from '~/context/PolymeshContext/constants';
import { formatDid } from '~/helpers/formatters';
import { convertIpfsLink } from '~/layouts/Portfolio/components/NftView/helpers';
import { useWindowWidth } from '~/hooks/utility';
import {
  StyledButtonWrapper,
  StyledValue,
  StyledInput,
  StyledLabel,
  StyledActionButton,
  StyledEndpointWrapper,
} from '../EndpointUrl/styles';

export const IpfsProvider = () => {
  const {
    settings: { ipfsProviderUrl, setIpfsProviderUrl },
  } = useContext(PolymeshContext);
  const { isMobile } = useWindowWidth();

  const [customIpfsUrl, setCustomIpfsUrl] = useState<string>(
    ipfsProviderUrl || '',
  );
  const [modalExpanded, setModalExpanded] = useState(false);

  const handleResetToDefault = () => {
    setCustomIpfsUrl(IPFS_PROVIDER_URL);
  };

  const handleApply = () => {
    setIpfsProviderUrl(customIpfsUrl);
  };

  const handleClose = () => {
    setCustomIpfsUrl(ipfsProviderUrl);
    setModalExpanded(false);
  };

  return (
    <>
      <StyledValue onClick={() => setModalExpanded(true)}>
        {ipfsProviderUrl.length > 28
          ? formatDid(ipfsProviderUrl, isMobile ? 10 : 12, isMobile ? 11 : 13)
          : ipfsProviderUrl}
        {ipfsProviderUrl !== IPFS_PROVIDER_URL && (
          <StyledLabel>
            <Icon name="Alert" size="18px" />
            Custom
          </StyledLabel>
        )}
      </StyledValue>
      {modalExpanded && (
        <Modal handleClose={handleClose}>
          <Heading type="h4" marginBottom={24}>
            Configure IPFS Provider Url
          </Heading>
          <StyledEndpointWrapper>
            <Text bold>RPC URL</Text>
            <StyledActionButton
              disabled={customIpfsUrl === IPFS_PROVIDER_URL}
              onClick={handleResetToDefault}
            >
              <Icon name="Refresh" />
              {!isMobile && 'Reset to Default'}
            </StyledActionButton>
          </StyledEndpointWrapper>
          <StyledInput
            placeholder="https://example.io/ipfs"
            value={customIpfsUrl}
            onChange={({ target }) => setCustomIpfsUrl(target.value)}
          />
          <StyledButtonWrapper>
            {!isMobile && (
              <Button variant="modalSecondary" onClick={handleClose}>
                Cancel
              </Button>
            )}
            <Button
              variant="modalPrimary"
              disabled={!customIpfsUrl || customIpfsUrl === ipfsProviderUrl}
              onClick={handleApply}
            >
              Apply
            </Button>
          </StyledButtonWrapper>
        </Modal>
      )}
    </>
  );
};
