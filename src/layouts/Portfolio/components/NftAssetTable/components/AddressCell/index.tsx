import { formatDid } from '~/helpers/formatters';
import { CopyToClipboard } from '~/components';
import { AddressCellWrapper } from '../../../AssetTable/styles';

interface IAddressCellProps {
  address: string;
}

export const AddressCell: React.FC<IAddressCellProps> = ({ address }) => (
  <AddressCellWrapper>
    {formatDid(address)}
    <CopyToClipboard value={address} />
  </AddressCellWrapper>
);
