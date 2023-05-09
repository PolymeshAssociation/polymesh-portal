import { useContext, useState } from 'react';
import { Modal, Icon } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import {
  StyledButtonWrapper,
  StyledValue,
  StyledInput,
  StyledLabel,
  StyledActionButton,
} from './styles';

export const RpcUrl = () => {
  const {
    settings: { nodeUrl, setNodeUrl },
  } = useContext(PolymeshContext);
  const [editRpcExpanded, setEditRpcExpanded] = useState(false);
  const [rpcUrl, setRpcUrl] = useState('');

  const toggleModal = () => setEditRpcExpanded((prev) => !prev);

  const handleApply = () => {
    setNodeUrl(rpcUrl);
    setRpcUrl('');
    toggleModal();
  };

  const handleResetToDefault = () => {
    setNodeUrl(import.meta.env.VITE_NODE_URL);
    toggleModal();
  };

  return (
    <>
      <StyledValue onClick={toggleModal}>
        {nodeUrl}
        {nodeUrl !== import.meta.env.VITE_NODE_URL && (
          <StyledLabel>
            <Icon name="Alert" size="18px" />
            Custom URL
          </StyledLabel>
        )}
      </StyledValue>
      {editRpcExpanded && (
        <Modal handleClose={toggleModal}>
          <Heading type="h4" marginBottom={48}>
            RPC URL
          </Heading>
          <StyledInput
            placeholder="https://example.com"
            value={rpcUrl}
            onChange={({ target }) => setRpcUrl(target.value)}
          />
          <StyledActionButton
            marginTop={24}
            disabled={nodeUrl === import.meta.env.VITE_NODE_URL}
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
              disabled={!rpcUrl || rpcUrl === nodeUrl}
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
