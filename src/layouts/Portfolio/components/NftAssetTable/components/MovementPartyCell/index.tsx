import { IMovementParty } from '../../../AssetTable/constants';
import { AddressCell } from '../AddressCell';

interface IMovementPartyCellProps {
  party: IMovementParty;
}

export const MovementPartyCell: React.FC<IMovementPartyCellProps> = ({
  party,
}) => {
  const { name, accountAddress } = party;

  if (accountAddress) {
    return <AddressCell address={accountAddress} />;
  }

  return name || 'Default';
};
