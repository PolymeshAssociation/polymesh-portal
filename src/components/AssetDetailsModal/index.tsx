import { Asset } from '@polymeshassociation/polymesh-sdk/types';
import { useAssetDetails } from '~/hooks/polymesh/useAssetDetails';
import { AssetDetailsCard } from '../AssetDetailsCard';
import Modal from '../Modal';

interface IAssetDetailsModalProps {
  asset: string | Asset;
  toggleModal: () => void;
}
export const AssetDetailsModal: React.FC<IAssetDetailsModalProps> = ({
  asset,
  toggleModal,
}) => {
  const { assetDetails, assetDetailsLoading } = useAssetDetails(asset);

  return (
    <Modal handleClose={toggleModal} customWidth="780px">
      <AssetDetailsCard
        assetDetailsLoading={assetDetailsLoading}
        assetDetails={assetDetails}
      />
    </Modal>
  );
};
