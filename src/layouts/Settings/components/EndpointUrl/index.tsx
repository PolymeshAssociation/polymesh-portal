import { useContext, useState } from 'react';
import { Modal, Icon } from '~/components';
import { Button, Heading, Text } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { formatDid } from '~/helpers/formatters';
import { useWindowWidth } from '~/hooks/utility';
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
  const { isMobile } = useWindowWidth();

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
      middlewareEndpointKey != null &&
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
          setNodeEndpoint(import.meta.env.VITE_NODE_URL);
          break;
        case EndpointTypes.MIDDLEWARE:
          setMiddlewareEndpoint(import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL);
          break;
        case 'key':
          setMiddlewareEndpointKey(
            import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY || '',
          );
          break;

        default:
          break;
      }
    } else {
      setNodeEndpoint(import.meta.env.VITE_NODE_URL);
      setMiddlewareEndpoint(import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL);
      setMiddlewareEndpointKey(
        import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY || '',
      );
    }
  };

  const handleCancel = () => {
    toggleModal();
    setNodeEndpoint(nodeUrl);
    setMiddlewareEndpoint(middlewareUrl);
    setMiddlewareEndpointKey(middlewareKey);
  };

  return (
    <>
      <StyledValue onClick={toggleModal}>
        {configuredEndpoint.length > 28
          ? formatDid(
              configuredEndpoint,
              isMobile ? 10 : 12,
              isMobile ? 11 : 13,
            )
          : configuredEndpoint}
        {((type === EndpointTypes.RPC &&
          nodeUrl !== import.meta.env.VITE_NODE_URL) ||
          (type === EndpointTypes.MIDDLEWARE &&
            middlewareEndpoint !==
              import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL)) && (
          <StyledLabel>
            <Icon name="Alert" size="18px" />
            Custom
          </StyledLabel>
        )}
      </StyledValue>
      {editUrlExpanded && (
        <Modal handleClose={handleCancel}>
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
              {!isMobile && 'Reset to Default'}
            </StyledActionButton>
          </StyledEndpointWrapper>
          <StyledInput
            placeholder="wss://example.com"
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
              {!isMobile && 'Reset to Default'}
            </StyledActionButton>
          </StyledEndpointWrapper>
          <StyledInput
            placeholder="https://example.com"
            value={middlewareEndpoint}
            onChange={({ target }) => setMiddlewareEndpoint(target.value)}
          />

          <StyledEndpointWrapper marginTop={24}>
            <Text bold>Middleware Key (Optional)</Text>
            <StyledActionButton
              disabled={
                middlewareEndpointKey.trim() ===
                import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY
              }
              onClick={() => handleResetToDefault('key')}
            >
              <Icon name="Refresh" />
              {!isMobile && 'Reset to Default'}
            </StyledActionButton>
          </StyledEndpointWrapper>
          <StyledInput
            placeholder="Enter Middleware API key if required"
            value={middlewareEndpointKey}
            onChange={({ target }) => setMiddlewareEndpointKey(target.value)}
          />
          <StyledActionButton
            marginTop={24}
            disabled={
              middlewareEndpoint.trim() ===
                import.meta.env.VITE_SUBQUERY_MIDDLEWARE_URL &&
              nodeEndpoint.trim() === import.meta.env.VITE_NODE_URL &&
              middlewareEndpointKey.trim() ===
                import.meta.env.VITE_SUBQUERY_MIDDLEWARE_KEY
            }
            onClick={() => handleResetToDefault()}
          >
            <Icon name="Refresh" />
            Reset All to Default
          </StyledActionButton>
          <StyledButtonWrapper>
            {!isMobile && (
              <Button variant="modalSecondary" onClick={handleCancel}>
                Cancel
              </Button>
            )}
            <Button
              variant="modalPrimary"
              disabled={
                (nodeUrl === nodeEndpoint.trim() &&
                  middlewareUrl === middlewareEndpoint.trim() &&
                  middlewareKey === middlewareEndpointKey.trim()) ||
                !nodeEndpoint ||
                !middlewareEndpoint
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
