import { useContext, useState } from 'react';
import { Modal, Icon } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatDid } from '~/helpers/formatters';
import {
  StyledButtonWrapper,
  StyledValue,
  StyledInput,
  StyledLabel,
  StyledActionButton,
} from './styles';

export enum EndpointTypes {
  RPC = 'rpc',
  MIDDLEWARE = 'middleware',
}

interface IEndpointUrlProps {
  type: EndpointTypes;
}

export const EndpointUrl: React.FC<IEndpointUrlProps> = ({ type }) => {
  const {
    settings: { nodeUrl, setNodeUrl, middlewareUrl, setMiddlewareUrl },
  } = useContext(PolymeshContext);

  const defaultEndpoint =
    type === EndpointTypes.MIDDLEWARE
      ? import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL
      : import.meta.env.VITE_NODE_URL;
  const configuredEndpoint =
    type === EndpointTypes.MIDDLEWARE ? middlewareUrl : nodeUrl;
  const setConfiguredEndpoint =
    type === EndpointTypes.MIDDLEWARE ? setMiddlewareUrl : setNodeUrl;

  const [editUrlExpanded, setEditUrlExpanded] = useState(false);
  const [endpointUrl, setEndpointUrl] = useState(configuredEndpoint || '');

  const toggleModal = () => setEditUrlExpanded((prev) => !prev);

  const handleApply = () => {
    setConfiguredEndpoint(endpointUrl);
    setEndpointUrl('');
    toggleModal();
  };

  const handleResetToDefault = () => {
    setConfiguredEndpoint(defaultEndpoint);
    toggleModal();
  };

  return (
    <>
      <StyledValue onClick={toggleModal}>
        {configuredEndpoint.length > 28
          ? formatDid(configuredEndpoint, 12, 13)
          : configuredEndpoint}
        {configuredEndpoint !== defaultEndpoint &&
          type === EndpointTypes.RPC && (
            <StyledLabel>
              <Icon name="Alert" size="18px" />
              Custom URL
            </StyledLabel>
          )}
      </StyledValue>
      {editUrlExpanded && (
        <Modal handleClose={toggleModal}>
          <Heading type="h4" marginBottom={48}>
            RPC URL
          </Heading>
          <StyledInput
            placeholder="https://example.com"
            value={endpointUrl}
            onChange={({ target }) => setEndpointUrl(target.value)}
          />
          <StyledActionButton
            marginTop={24}
            disabled={configuredEndpoint === defaultEndpoint}
            onClick={handleResetToDefault}
          >
            <Icon name="Check" />
            Reset to Default
          </StyledActionButton>
          <StyledButtonWrapper>
            <Button variant="modalSecondary" onClick={toggleModal}>
              Cancel
            </Button>
            <Button
              variant="modalPrimary"
              disabled={!endpointUrl || endpointUrl === configuredEndpoint}
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
