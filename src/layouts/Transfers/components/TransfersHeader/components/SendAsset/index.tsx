import { Modal } from '~/components';

interface ISendAssetProps {
  toggleModal: () => void | React.ReactEventHandler | React.ChangeEventHandler;
}

export const SendAsset: React.FC<ISendAssetProps> = ({ toggleModal }) => {
  return <Modal handleClose={toggleModal}>send asset</Modal>;
};
