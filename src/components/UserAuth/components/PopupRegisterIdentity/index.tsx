import { Modal } from '~/components';
import { Heading } from '~/components/UiKit';
import { useAuthContext } from '~/context/AuthContext';
import { SelfAssignDid } from './components/SelfAssignDid';
import { ModalContainer, ModalContent } from './styles';

export const PopupRegisterIdentity = () => {
  const { showIdentityPopup, setShowIdentityPopup } = useAuthContext();

  if (!showIdentityPopup) {
    return null;
  }

  return (
    <Modal handleClose={() => setShowIdentityPopup(false)} customWidth="600px">
      <ModalContainer>
        <ModalContent>
          <Heading type="h3">Register a Decentralized Identity</Heading>
        </ModalContent>
        <SelfAssignDid />
      </ModalContainer>
    </Modal>
  );
};
