import { formatUuid, hexToUuid } from '~/helpers/formatters';
import { CopyToClipboard } from '~/components';
import { AssetIdCellWrapper } from '../../../AssetTable/styles';

interface IAssetIdCellProps {
  assetId: string;
  abbreviate?: boolean;
}

export const AssetIdCell: React.FC<IAssetIdCellProps> = ({
  assetId,
  abbreviate = true,
}) => {
  const formattedAssetId = abbreviate
    ? formatUuid(hexToUuid(assetId))
    : hexToUuid(assetId);

  return (
    <AssetIdCellWrapper>
      {assetId ? (
        <>
          {formattedAssetId}
          <CopyToClipboard value={hexToUuid(assetId)} />
        </>
      ) : (
        '-'
      )}
    </AssetIdCellWrapper>
  );
};
