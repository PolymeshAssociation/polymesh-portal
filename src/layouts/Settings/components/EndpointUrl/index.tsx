import { useContext, useState } from 'react';
import { Modal, Icon } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatDid } from '~/helpers/formatters';
import {
  StyledButtonWrapper,
  StyledValue,
  StyledInput,
  StyledLabel,
  StyledActionButton,
  StyledEndpointWrapper,
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
    settings: {
      nodeUrl,
      setNodeUrl,
      middlewareUrl,
      setMiddlewareUrl,
      middlewareKey,
      setMiddlewareKey,
    },
  } = useContext(PolymeshContext);
  const [nodeEndpoint, setNodeEndpoint] = useState(nodeUrl || '');
  const [middlewareEndpoint, setMiddlewareEndpoint] = useState(
    middlewareUrl || '',
  );
  const [middlewareEndpointKey, setMiddlewareEndpointKey] = useState(
    middlewareKey || '',
  );

  const configuredEndpoint =
    type === EndpointTypes.MIDDLEWARE ? middlewareUrl : nodeUrl;

  const [editUrlExpanded, setEditUrlExpanded] = useState(false);

  const toggleModal = () => setEditUrlExpanded((prev) => !prev);

  const handleApply = () => {
    if (nodeEndpoint && nodeEndpoint.trim() !== nodeUrl) {
      setNodeUrl(nodeEndpoint.trim());
    }
    if (middlewareEndpoint && middlewareEndpoint.trim() !== middlewareUrl) {
      setMiddlewareUrl(middlewareEndpoint.trim());
    }
    if (
      middlewareEndpointKey &&
      middlewareEndpointKey.trim() !== middlewareKey
    ) {
      setMiddlewareKey(middlewareEndpointKey.trim());
    }
    toggleModal();
  };

  const handleResetToDefault = (endpointType?: EndpointTypes | 'key') => {
    if (endpointType) {
      switch (endpointType) {
        case EndpointTypes.RPC:
          setNodeUrl(import.meta.env.VITE_NODE_URL);
          break;
        case EndpointTypes.MIDDLEWARE:
          setMiddlewareUrl(import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL);
          break;
        case 'key':
          setMiddlewareKey(import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY || '');
          localStorage.removeItem('middlewareKey');
          break;

        default:
          break;
      }
    } else {
      setNodeUrl(import.meta.env.VITE_NODE_URL);
      setMiddlewareUrl(import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL);
      setMiddlewareKey(import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY || '');
      localStorage.removeItem('middlewareKey');
    }
    toggleModal();
  };

  return (
    <>
      <StyledValue onClick={toggleModal}>
        {configuredEndpoint.length > 28
          ? formatDid(configuredEndpoint, 12, 13)
          : configuredEndpoint}
        {nodeUrl !== import.meta.env.VITE_NODE_URL &&
          type === EndpointTypes.RPC && (
            <StyledLabel>
              <Icon name="Alert" size="18px" />
              Custom URL
            </StyledLabel>
          )}
      </StyledValue>
      {editUrlExpanded && (
        <Modal handleClose={toggleModal}>
          <Heading type="h4" marginBottom={24}>
            Configure Endpoints
          </Heading>
          <StyledEndpointWrapper>
            <Text bold>RPC URL</Text>
            <StyledActionButton
              disabled={nodeEndpoint.trim() === import.meta.env.VITE_NODE_URL}
              onClick={() => handleResetToDefault(EndpointTypes.RPC)}
            >
              <Icon name="Refresh" />
              Reset to Default
            </StyledActionButton>
          </StyledEndpointWrapper>
          <StyledInput
            placeholder="https://example.com"
            value={nodeEndpoint}
            onChange={({ target }) => setNodeEndpoint(target.value)}
          />

          <StyledEndpointWrapper marginTop={24}>
            <Text bold>Middleware URL</Text>
            <StyledActionButton
              disabled={
                middlewareEndpoint.trim() ===
                import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL
              }
              onClick={() => handleResetToDefault(EndpointTypes.MIDDLEWARE)}
            >
              <Icon name="Refresh" />
              Reset to Default
            </StyledActionButton>
          </StyledEndpointWrapper>
          <StyledInput
            placeholder="https://example.com"
            value={middlewareEndpoint}
            onChange={({ target }) => setMiddlewareEndpoint(target.value)}
          />

          <StyledEndpointWrapper marginTop={24}>
            <Text
              bold
              color={
                middlewareEndpoint.trim() ===
                import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL
                  ? 'secondary'
                  : 'primary'
              }
            >
              Middleware Key (Optional)
            </Text>
            <StyledActionButton
              disabled={
                middlewareEndpointKey.trim() ===
                import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY
              }
              onClick={() => handleResetToDefault('key')}
            >
              <Icon name="CloseIcon" size="24px" />
              Clear
            </StyledActionButton>
          </StyledEndpointWrapper>
          <StyledInput
            placeholder="Enter Middleware Key if one is needed"
            value={middlewareEndpointKey}
            disabled={
              middlewareEndpoint.trim() ===
              import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL
            }
            onChange={({ target }) => setMiddlewareEndpointKey(target.value)}
          />
          <StyledActionButton
            marginTop={24}
            disabled={
              middlewareUrl.trim() ===
                import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL &&
              nodeUrl.trim() === import.meta.env.VITE_NODE_URL &&
              middlewareKey.trim() ===
                import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY
            }
            onClick={() => handleResetToDefault()}
          >
            <Icon name="Refresh" />
            Reset All to Default
          </StyledActionButton>
          <StyledButtonWrapper>
            <Button variant="modalSecondary" onClick={toggleModal}>
              Cancel
            </Button>
            <Button
              variant="modalPrimary"
              disabled={
                nodeUrl === nodeEndpoint.trim() &&
                middlewareUrl === middlewareEndpoint.trim() &&
                middlewareKey === middlewareEndpointKey.trim()
              }
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
