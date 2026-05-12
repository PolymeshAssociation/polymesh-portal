import { hexToUuid, isHexUuid } from '@polymeshassociation/polymesh-sdk/utils';
import { NavLink } from 'react-router-dom';
import { CopyToClipboard } from '~/components';
import { formatUuid } from '~/helpers/formatters';
import { AssetIdCellWrapper } from './styles';

interface IAssetIdCellProps {
  assetId: string;
  abbreviate?: boolean;
  isNftCollection?: boolean;
  disableNavigation?: boolean;
}

export const AssetIdCell: React.FC<IAssetIdCellProps> = ({
  assetId,
  abbreviate = true,
  isNftCollection = false,
  disableNavigation = false,
}) => {
  const assetUuid = isHexUuid(assetId) ? hexToUuid(assetId) : assetId;
  const formattedAssetId = abbreviate ? formatUuid(assetUuid) : assetUuid;

  return (
    <AssetIdCellWrapper>
      {assetUuid ? (
        <>
          {disableNavigation ? (
            <span>{formattedAssetId}</span>
          ) : (
            <NavLink
              to={
                isNftCollection
                  ? `/balances?nftCollection=${assetUuid}`
                  : `/balances?asset=${assetUuid}`
              }
            >
              {formattedAssetId}
            </NavLink>
          )}
          <CopyToClipboard value={assetUuid} />
        </>
      ) : (
        '-'
      )}
    </AssetIdCellWrapper>
  );
};
