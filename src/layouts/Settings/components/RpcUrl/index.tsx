import { useContext, useState } from 'react';
import { Modal } from '~/components';
import { Button, Heading } from '~/components/UiKit';
import { PolymeshContext } from '~/context/PolymeshContext';
import { StyledButtonWrapper, StyledValue, StyledInput } from './styles';

export const RpcUrl = () => {
  const {
    settings: { nodeUrl, setNodeUrl },
  } = useContext(PolymeshContext);
  const [editRpcExpanded, setEditRpcExpanded] = useState(false);
  const [rpcUrl, setRpcUrl] = useState('');

  const toggleModal = () => setEditRpcExpanded((prev) => !prev);

  const handleApply = () => {
    setNodeUrl(rpcUrl);
    toggleModal();
  };

  return (
    <>
      <StyledValue onClick={toggleModal}>{nodeUrl}</StyledValue>
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
